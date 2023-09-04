const { HumanMessagePromptTemplate, SystemMessagePromptTemplate, ChatPromptTemplate } = require('langchain/prompts');
const { ChatOpenAI } = require('langchain/chat_models/openai')
const { LLMChain } = require('langchain/chains')
const csvToJson = require('convert-csv-to-json');

const sheets = require('./../sheets')

const GENERATE_DATA_SYSTEM_PROMPT = `You are given a topic, number of columns and number of rows. 
Generate a title based on the topic given in less than 30 characters in the first line.
From the second line, generate a csv that can be uploaded into google sheets. Generate the header row and the data for it only based on the topic. You are also given the number of columns and the number of rows to generate.

For example
Input
Topic: Employee data
No of Columns: 6
No of Rows: 2

Output
Employee Salary Data
First Name, Last Name, Employee ID, Department, Position, Salary
John, Smith, 12345, IT, Manager, 80000
Alice, Johnson, 67890, Sales, Associate, 50000

If you need to give a number for a column
Write numbers with all zeroes, do not write numbers in words such as billion or millions. For example instead of 1 million, write 1000000.
If you need to denote currency, add the currency symbol in the column title, not in the values`;

const USER_INPUT_PROMPT = `Title: {title}\nNo of Columns: {colCount}\nNo of Rows: {rowCount}`

module.exports = async (req, res) => {
    //TODO: Add body validation
    const { topic: sheetTopic, rowCount, colCount, outputPath } = req.body || {};

    // ask ai to generate csv data based on topic and row count
    const ai = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
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
    await sheets.create(title, output, outputPath)

    return res.status(201).send()
};


const convertDataToWritableFormat = (result = '') => {
    const lines = result.split('\n')
    // each line has comma separated values
    let output = [];

    // first line is the title
    const title = result[0];

    // every line from second line is the data
    result.slice(1);

    for (let line of lines) {
        const values = line.split(',').map(val => val.trim())
        output = [...output, values]
    }

    return { title, output }
}