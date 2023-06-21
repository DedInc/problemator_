const express = require('express');
const Problemator = require('./problemator');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  try {
    const problemator = new Problemator();
    await problemator.loadSession();

    let categoryList = '';
    let dem = '-';

    const getCurrentMaxDepth = (categories, depth = 0, currentMaxDepth = 0) => {
      currentMaxDepth = Math.max(currentMaxDepth, depth);
      for (let category in categories) {
        if (typeof categories[category] === 'object') {
          currentMaxDepth = getCurrentMaxDepth(categories[category], depth + 1, currentMaxDepth);
        }
      }
      return currentMaxDepth;
    };

    const parseCategories = (categories, depth = 0) => {      
      for (let category in categories) {
        if (depth === 0) {
          currentCategoryMaxDepth = getCurrentMaxDepth(categories[category], depth) + 1;
        }

        categoryList += ' '.repeat(depth * 2);
        if (category == 'name') {
          category = `${categories['id']}: ${categories['name']}`;
        } else if (category == 'id') {
          continue;
        }        

        let demText = (depth === 2 || depth === 3) ? '' : `${dem.repeat(depth)}`;

        if (currentCategoryMaxDepth === 4) {
          demText = (depth === 3 || depth === 4) ? '' : `${dem.repeat(depth)}`;
        }

        if (currentCategoryMaxDepth === 3) {
          if (depth === 2) {
            categoryList += `<li class="depth-${depth}"><p>${demText}${category}:</p></li>`;
          } else {
            categoryList += `<li class="depth-${depth}"><code>${demText}${category}</code></li>`;
          }
        } else {
          if (depth === 2) {
            categoryList += `<li class="depth-${depth}" style="color: #ffe200">${demText}${category}:</li>`;
          } else if (depth === 3) {
            categoryList += `<li class="depth-${depth}"><p>${demText}${category}:</p></li>`;
          } else {
            categoryList += `<li class="depth-${depth}"><code>${demText}${category}</code></li>`;
          }
        }

        if (typeof categories[category] === 'object') {
          categoryList += '<ul>';
          parseCategories(categories[category], depth + 1);
          categoryList += '</ul>';
        }
      }
    };    
    parseCategories(problemator.categories);

    const documentation = `
      <!DOCTYPE html>
  <html>
    <head>
      <title>Problemator API Documentation</title>
      <style>
        body {
          background-color: #171a21;
          color: #fff;
          font-family: Arial, sans-serif;
          line-height: 1.5;
          padding: 2rem;
        }

        /* Customize the scrollbar */
        ::-webkit-scrollbar {
          width: 8px; /* Width of the scrollbar */
        }

        ::-webkit-scrollbar-track {
          background-color: #f1f1f1; /* Color of the scrollbar track */
        }

        ::-webkit-scrollbar-thumb {
          background-color: #888; /* Color of the scrollbar handle */
          border-radius: 4px; /* Rounded corners of the scrollbar handle */
        }

        ::-webkit-scrollbar-thumb:hover {
          background-color: #555; /* Color of the scrollbar handle on hover */
        }

        h1 {
          font-size: 2.5em;
          margin-bottom: 0.5em;
        }

        h2 {
          font-size: 1.8em;
          margin-bottom: 0.5em;
        }

        p {
          margin-bottom: 1.5em;
        }

        code {
          background-color: #333;
          color: #fff;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 0.9em;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          margin-bottom: 0.8em;
        }

        .depth-0 {
          color: #90cdf4;
          font-size: 1.1em;
          font-weight: bold;
          border-bottom: 1px solid #b8daff;
          padding-bottom: 0.2em;
        }

        .depth-1 {
          color: #b8daff;
          font-size: 1.05em;
          font-weight: bold;
          margin-left: 2em;
          border-left: 2px solid #b8daff;
          padding-left: 0.5em;
        }

        .depth-2, .depth-3, .depth-4 {
          color: #87c38f;
          font-size: 1em;
          font-weight: bold;
          margin-left: 4em;
        }

        .depth-3, .depth-4 {
          font-style: italic;
        }

        .depth-4 {
          margin-left: 6em;
        }

        .depth-3 code {
          font-size: 0.9em;
        }

        .depth-0 code, .depth-1 code, .depth-2 code, .depth-3 code {
          background-color: #333;
          color: #fff;
          padding: 2px 5px;
          border-radius: 3px;
        }

        ul.depth-0 {
          margin-left: 0;
          padding-left: 0;
        }

        ul.depth-0 > li {
          list-style: none;
        }

        ul.depth-1 {
          margin-left: 2em;
          padding-left: 0;
        }

        ul.depth-1 > li {
          list-style: none;
        }

        ul.depth-2 {
          margin-left: 4em;
          padding-left: 0;
        }

        ul.depth-2 > li {
          list-style: none;
        }

        ul.depth-3 {
          margin-left: 6em;
          padding-left: 0;
        }

        ul.depth-3 > li {
          list-style: none;
        }

        a {
          color: #fff;
          text-decoration: none;
          transition: color 0.3s;
        }

        a:hover {
          color: #90cdf4;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5em;
        }

        table thead th {
          background-color: #333;
          color: #fff;
          padding: 0.5em;
          text-align: left;
        }

        table tbody td {
          padding: 0.5em;
          border-bottom: 1px solid #444;
        }
      </style>
      <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
      <script>
        $(document).ready(function() {
          $('table tbody td:nth-child(2)').each(function() {
            if ($(this).text() === 'GET') {
              $(this).css({
                'background-color': '#33a84d',
                'color': '#fff'
              });
            }
          });
        });
      </script>
    </head>
     <body>
      <h1>Problemator API Documentation</h1>
      <p>Welcome to the API documentation for the Problemator API!</p>
      <h2>Endpoints</h2>
      <p>These are the available API endpoints:</p>

      <table>
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>/api/generate-problem?level=[level]&amp;type=[type]</code></td>
            <td>GET</td>
            <td>
              Generate a problem with the specified level and type.
              <ul>
                <li>
                  <strong>Level:</strong> 0 (Beginner), 1 (Intermediate), 2 (Advanced)
                </li>
                <li>
                  <strong>Type:</strong> Type - it's a category name (you can see below)
                </li>
              </ul>
            </td>
          </tr>
          <tr>
            <td><code>/api/check-problem?problem=[problem]&amp;answer=[answer]</code></td>
            <td>GET</td>
            <td>
              Check the provided answer for a problem.
              <ul>
                <li>
                  <strong>Problem:</strong> Problem - response from generation of problem
                </li>
                <li>
                  <strong>Answer:</strong> Answer - your answer like 'x + 5'
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Categories</h2>
      <p>Here is a list of categories and subcategories:</p>
      <ul>
        ${categoryList}
      </ul>
    </body>
  </html>
    `;

    res.send(documentation);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

async function generateProblem(problemator, level, type) {
  const problem = await problemator.generateProblem(level, type);
  const userAnswer = 5;
  let checkResult;

  try {
    checkResult = await problemator.checkProblem(problem, userAnswer);
  } catch (error) {
    return generateProblem(problemator, level, type);
  }

  return problem;
}

app.get('/api/generate-problem', async (req, res) => {
  try {
    const problemator = new Problemator();
    await problemator.loadSession();

    const level = req.query.level;
    const type = req.query.type;

    const problem = await problemator.generateProblem(level, type);

    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/check-problem', async (req, res) => {
  try {
    const problemator = new Problemator();
    await problemator.loadSession();    
    const problem = JSON.parse(decodeURIComponent(req.query.problem));    
    const result = await problemator.checkProblem(problem, req.query.answer);    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});