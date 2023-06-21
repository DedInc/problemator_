const axios = require('axios');

// Example 1: Generate a problem
async function generateProblem() {
  try {
    const response = await axios.get('http://localhost:3000/api/generate-problem', {
      params: {
        level: 1, // Intermediate
        type: 'IntegerAddition', // Category name
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error generating problem:', error);
  }
}

// Example 2: Check a problem
async function checkProblem(problem, answer) {
  params = {
        problem: encodeURIComponent(JSON.stringify(problem)),
        answer: encodeURIComponent(answer)
  }
  console.log(params);
  try {
    const response = await axios.get('http://localhost:3000/api/check-problem', {
      params: {
        problem: encodeURIComponent(JSON.stringify(problem)),
        answer: encodeURIComponent(answer),
      },
    });

    console.log('Check problem result:', response.data);
  } catch (error) {
    console.error('Error checking problem:', error);
  }
}

(async () => {
  const exampleProblem = await generateProblem();

  const userAnswer = '4';
  await checkProblem(exampleProblem, userAnswer);
})();