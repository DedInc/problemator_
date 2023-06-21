const axios = require('axios');
const { CookieJar, Cookie } = require('tough-cookie');

class Problemator {
  constructor() {
    this.categories = {};
    this.loadSession();
  }

  searchCategories(cats) {
    for (const c of cats) {
      if ('Subcategories' in c) {
        this.searchCategories(c['Subcategories']);
      } else {
        this.categories[c['LinkTo']] = Object.keys(this.categories).length;
      }
    }
  }

  getCategory(id) {
    for (const cat in this.categories) {
      if (this.categories[cat] === id) {
        return cat;
      }
    }
  }

  async loadSession() {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'ru-RU,ru;q=0.9,kk-KZ;q=0.8,kk;q=0.7,en-US;q=0.6,en;q=0.5',
    };

    const response = await axios.get('https://www.wolframalpha.com/input/wpg/categories.jsp?load=true', { headers });

    this.session = axios.create({ headers, withCredentials: true });
    this.session.defaults.headers.Cookie = response.headers['set-cookie'].join('; ');

    this.searchCategories(response.data['Categories']['Categories']);
    this.API = response.data['domain'];
  }

  async checkProblem(problem, answer) {
    const lvl = problem['difficulty'];
    const pid = problem['id'];
    const machine = problem['machine'];    

    for (const c of problem['session']) {      
      const cookie = new Cookie(c);      
      let old_value = this.session.defaults.headers.Cookie.split('JSESSIONID=')[1].split(';')[0];
      this.session.defaults.headers.Cookie = this.session.defaults.headers.Cookie.replace(old_value, c['value']);
    }

    const response = await this.session.get(`${this.API}/input/wpg/checkanswer.jsp?attempt=1&difficulty=${lvl}&load=true&problemID=${pid}&query=${answer}&s=${machine}&type=InputField`);

    return {
      'correct': response.data['correct'],
      'hint': response.data['hint'],
      'solution': response.data['solution'],
    };
  }

  async generateProblem(lvl = 0, type = 'IntegerAddition') {
    const difficulty = { 0: 'Beginner', 1: 'Intermediate', 2: 'Advanced' }[lvl];

    const response = await this.session.get(`${this.API}/input/wpg/problem.jsp?count=1&difficulty=${difficulty}&load=1&type=${type}`);

    const problems = response.data['problems'];
    const machine = response.data['machine'];
    const cookies = [];

    if (response.headers['set-cookie']) {
      response.headers['set-cookie'].forEach((cookieStr) => {
        const cookie = Cookie.parse(cookieStr);
        if (cookie.key === 'JSESSIONID') {
          cookies.push({ name: cookie.key, value: cookie.value, domain: cookie.domain });
        }
      });
    }

    const problem = problems[0];

    if (cookies.length === 0 || !problem) {
      return await this.generateProblem(lvl, type);
    }

    return {
      'text': problem['string_question'],
      'image': problem['problem_image'],
      'difficulty': difficulty,
      'id': problem['problem_id'],
      'machine': machine,
      'session': cookies,
    };
  }
}

module.exports = Problemator;