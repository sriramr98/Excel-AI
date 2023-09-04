# Excel AI

## How to Run

1. Install Node
2. Run `node index.js`
3. Server is started on port 3000

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
