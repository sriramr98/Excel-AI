const { HumanMessagePromptTemplate, SystemMessagePromptTemplate, ChatPromptTemplate } = require('langchain/prompts');
const { ChatOpenAI } = require('langchain/chat_models/openai')
const { LLMChain } = require('langchain/chains')

const sheets = require('./../sheets')

const GENERATE_DATA_SYSTEM_PROMPT = `You are given a topic, number of columns and number of rows. Your only goal is to generate data based on the given topic, number of columns and rows.
Generate a JSON output which will be converted to CSV. Strictly follow the number of cols ( keys in json ) and no of rows (number of entries in JSON)
From the second line, generate a csv that can be uploaded into google sheets. Generate the header row and the data for it only based on the topic. You are also given the number of columns and the number of rows to generate.
Use comma (,) as a delimiter to separate each column. Don't use , inside a single row EVER.

For example
Input
Topic: Employee data
No of Columns: 6
No of Rows: 2

Output
{{ "title": "Employee Salaries", "data": [ {{ "first_name": "John", "last_name": "Smith", "employee_id": 12345, "department": "IT", "position": "Manager", "salary": 80000 }}, {{ "first_name": "Alice", "last_name": "Johnson", "employee_id": 23252, "department": "Sales", "position": "Associate", "salary": 80000 }} ]}}

title -> The title of the dataset ( should be strictly less than 25 characters )
data -> An array of objects where each object represents a piece of data. The array should be convertable to CSV format

There are two objects in the data array because the number of rows given are 2
There are 6 keys in each object in the data array because the number of rows given are 6

Use the same key with same spelling and casing for each object in the data array.
If you need to give a number for a column
Write numbers with all zeroes, do not write numbers in words such as billion or millions. For example instead of 1 million or 1M, write the full number 1000000.
If a column needs to contain numbers, only use numbers. Do not add any characters along with numbers. For example, instead of $80,000 use 80000`;

const USER_INPUT_PROMPT = `Title: {title}\nNo of Columns: {colCount}\nNo of Rows: {rowCount}`

module.exports = async (req, res) => {
    //TODO: Add body validation
    const { topic: sheetTopic, rowCount, colCount, outputPath } = req.body || {};

    // ask ai to generate csv data based on topic and row count
    const ai = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-4'
    }) 

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(GENERATE_DATA_SYSTEM_PROMPT),
        HumanMessagePromptTemplate.fromTemplate(USER_INPUT_PROMPT)
    ])

    const chain = new LLMChain({
        llm: ai,
        prompt: chatPrompt,
        verbose: true
    });

    const result = await chain.call({
        title: sheetTopic,
        rowCount,
        colCount
    })

    const { title, output } = convertDataToWritableFormat(result.text)
    console.log({ title, output })
    await sheets.create(title, output, outputPath)

    return res.status(201).send()
};


const convertDataToWritableFormat = (result = '') => {
    const { title, data = [] } = JSON.parse(result)

    let headers = Object.keys(data[0])
    headers = headers.map(header => {
        return header.replace("_", "").replace("-", " ").toUpperCase()
    })

    const dataRows = data.map(row => {
        return Object.values(row)
    })

    const output = [headers, ...dataRows];
    return { title,  output }
}

const inferTypeAndConvert = data => {
    const floating = parseFloat(data)
    if (floating) {
        return floating
    }
    return data
}