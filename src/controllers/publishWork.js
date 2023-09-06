const { ChatOpenAI } = require('langchain/chat_models/openai');
const sheets = require('./../sheets');
const { LLMChain } = require('langchain/chains');
const { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } = require('langchain/prompts');

const FORMULA_EXTRACTOR_PROMPT = `You are brilliant at creating new excel formulas to analyse data on Microsoft Excel.

You are given the metadata about a set of sheets present in a single excel file in the following format

[{{"name":"Country Population Data","headers":["Country",2010,2015,2020],"noOfRows":11}},{{"name":"Birth&Mortality Rates","headers":["Country","Birth Rate","Infant Mortality Rate","Adult Mortality Rate"],"noOfRows":12}}]

The number of rows count also includes the header row.
Given a user question and the structure of a set of sheets present in a single excel file give a list of steps to perform. You can choose from a list of actions given below.

A single step can have the following parameters
1. action - The action to perform explained in detail below
2. title - The title of a sheet ( only applicable when creating a new subsheet )
3. formula - The excel formula to be applied
4. sheet - The sheet number where the formula is to be applied
5. column - The column where the formula is to be applied for each row. Only use column when a formula is to be applied for every row.
6. cell - A single cell where the formula is to be applied.
7. header - The header to explain what the formula does when applied.
8. headerCell - The cell where the header needs to be written to.

Possible Actions
1. create_sub_sheet - This command can be used to create a new subsheet. This will require a title that is less than 25 characters. For example, when creating a pivot table or joining two datasets, we might want to create a new sheet first.
Sample Step Structure: {{ "action": "create_sub_sheet", "title": "Some Title Here" }}
----
2. formula_col - This will add a new column to the sheet and add a formula for each row in the sheet. This will require the column number where the formula is to be inserted. This formula will be applied for each row in the dataset. For example, if we want the average of some data in each row, we will add a formula in a new column referencing the required row values for the formula. Since this formula is to applied for every row, use a {{row}} template to denote the row number where required.
Sample Step Structure: {{ "action": "formula_col", "formula": "A{{row}}/SUM(A1:A10)", "column": "C". "sheet": 0, "header": "Average of A1 to A10", "headerCell": "C1" }}
----
3. formula_single - This will add a formula to a single cell in excel sheet. This will require the row_number and col_number to apply the formula. For example, if we need to sum all values in a column, we will need to choose a single cell where the sum is to be shown.
Sample Step Strucuture: {{ "action": "formula_single", "formula": "SUM(A1:A10)", "cell": "C13", "sheet": 0, "header": "Sum of A1 to A10", "headerCell": "C12" }}
---
4. not_sure - This action will denote that you are not sure on how to solve this problem.
Sample Step Structure: {{ "action": "not_sure" }}

For example 

1. If the sheet format is [{{"name":"Country Population Data","headers":["Country",2010,2015,2020],"noOfRows":11}},{{"name":"Birth&Mortality Rates","headers":["Country","Birth Rate","Infant Mortality Rate","Adult Mortality Rate"],"noOfRows":12}}] 
and the question asked is "Give me the average population of each country in 2020", the output should be [ {{ "action": "formula_col", "formula": "D{{row}}/(SUM(D2:D11))", "column": "F", "sheet": 0  }} ]`

const USER_PROMPT = `SheetFormat: {sheetFormat}\nQuestion: {question}`

module.exports = async (req, res) => {
    const { path: sheetPath, question } = req.body;

    const sheetsMetaData = sheets.getMeta(sheetPath)

    const ai = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-4'
    })

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(FORMULA_EXTRACTOR_PROMPT),
        HumanMessagePromptTemplate.fromTemplate(USER_PROMPT)
    ])

    const chain = new LLMChain({
        llm: ai,
        verbose: true,
        prompt: chatPrompt
    })

    const { text: stepsStr } = await chain.call({
        sheetFormat: JSON.stringify(sheetsMetaData),
        question
    })

    const steps = JSON.parse(stepsStr)
    // const steps = [ {action: 'create_sub_sheet', title: 'Test Sub Sheet'} ]

    for (let step of steps) {
        step = { ...step, path: sheetPath }
        switch (step.action) {
            case 'create_sub_sheet':
                await sheets.createSub(step)
                break;
            case 'formula_col':
                await sheets.applyFormulaOnCol(step, sheetsMetaData) 
                break;
            case 'formula_single':
                await sheets.applyFormulaOnCell(step)
                break;
            default:
                return res.status(400).json({ message: 'Something went wrong' })
        }
    }

    return res.json({ message: 'Your action is complete. Please open the sheet to view the results' })
};