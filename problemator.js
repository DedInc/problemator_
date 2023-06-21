const axios = require('axios');
const { Cookie } = require('tough-cookie');

class Problemator {
  constructor() {
    this.categories = {};
    this.loadSession();
  }

  convertCategories(categoriesDict, idCounter = 0) {
    const convertedData = {};

    for (const category of categoriesDict) {
      const categoryName = category.Display;
      const subcategories = category.Subcategories || [];

      if (subcategories.length > 0) {
        const [convertedSubcategories, newIdCounter] = this.convertCategories(subcategories, idCounter);
        convertedData[categoryName] = convertedSubcategories;
        idCounter = newIdCounter;
      } else {
        const linktoId = category.LinkTo;

        if (linktoId !== null && linktoId !== undefined) {
          convertedData[categoryName] = { name: linktoId, id: idCounter };
          idCounter++;
        }
      }
    }

    return [convertedData, idCounter];
  }

  getCategory(id, categories = null) {
    if (categories === null) {
      categories = this.categories;
    }

    for (const [cat, value] of Object.entries(categories)) {
      if (typeof value === 'object') {
        if ('id' in value && value.id === id) {
          return value.name;
        }

        const subcategoryResult = this.getCategory(id, value);
        if (subcategoryResult) {
          return subcategoryResult;
        }
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

    const [convertedCategories] = this.convertCategories(response.data.Categories.Categories);
    this.categories = convertedCategories;
    this.API = response.data.domain;
  }

  async checkProblem(problem, answer) {
    const lvl = problem.difficulty;
    const pid = problem.id;
    const machine = problem.machine;

    problem.session.forEach((c) => {
      const cookie = new Cookie(c);
      const oldValue = this.session.defaults.headers.Cookie.split('JSESSIONID=')[1].split(';')[0];
      this.session.defaults.headers.Cookie = this.session.defaults.headers.Cookie.replace(oldValue, c.value);
    });

    const params = {
      attempt: 1,
      difficulty: lvl,
      load: 'true',
      problemID: pid,
      query: answer,
      s: machine,
      type: 'InputField',
    };

    const response = await this.session.get(`${this.API}/input/wpg/checkanswer.jsp`, { params });

    return {
      correct: response.data.correct,
      hint: response.data.hint,
      solution: response.data.solution,
      attempt: response.data.attempt,
    };
  }

  async generateProblem(lvl = 0, type = 'IntegerAddition') {
    const difficulty = { 0: 'Beginner', 1: 'Intermediate', 2: 'Advanced' }[lvl];

    const params = {
      count: 1,
      difficulty: difficulty,
      load: 'true',
      type: type,
    };

    const response = await this.session.get(`${this.API}/input/wpg/problem.jsp`, { params });

    const problems = response.data.problems;
    const machine = response.data.machine;
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
      text: problem.string_question,
      image: problem.problem_image,
      difficulty: difficulty,
      question: problem.question,      
      machine: machine,
      session: cookies,
    };
  }
}

module.exports = Problemator;