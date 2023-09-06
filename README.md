# Excel AI

## How to Run

1. Install Node
2. Run `npm i`
3. Run `node index.js`
4. Server is started on port 3000

## Curl Requests

### Data Generation

```
curl --location 'http://localhost:3000/createSheet' \
--header 'Content-Type: application/json' \
--data '{
    "topic": "Anime list with rankings and year of release ordered by year of release",
    "rowCount": 10,
    "colCount": 2,
    "outputPath": "/Users/sriram-r/Desktop/personal/excel-ai/anime.xlsx"
}'
```

topic - A topic for which data is to be generated
rowCount - Number of rows to generate
colCount - Number of columns to generate
outputPath - The path where we write the output excel file

### Structured Data Analysis

```
curl --location 'http://localhost:3000/publishWorkStructured' \
--header 'Content-Type: application/json' \
--data '{
    "path": "/Users/sriram-r/Desktop/personal/excel-ai/salary.xlsx",
    "question": "What was the totla salary given?"
}'
```

path - The path of the excel sheet to perform the analysis on.
question - The question for which a formula would be written and applied to the sheet.
