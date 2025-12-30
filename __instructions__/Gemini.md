Overview
The goal is to build an agent that can perform tasks on behalf of a user.

The agent will be able to perform the following tasks:

1. Search for vehicle information
2. Compare vehicle information
3. Book a vehicle for inspection at a dealership
4. Negotiate the price of the vehicle with dealership
5. Find market trends

Build this agent using the following tools:

1. Product Search API
2. Product Compare API
3. Product Book API
4. Product Negotiate API

Mock these API's with the following responses:

1. Product Search API: Returns a list of vehicles based on the search criteria
2. Product Compare API: Returns a comparison of two vehicles
3. Product Book API: Returns a confirmation of the booking
4. Product Negotiate API: Returns a confirmation of the negotiation

For the above API's, create the following test data in json files:

1. Product Search API: product_search.json
2. Product Compare API: product_compare.json
3. Product Book API: product_book.json
4. Product Negotiate API: product_negotiate.json

Build a multi-agent system using the following agents:

1. Root Agent
2. Intent Agent
3. Product Search Agent
4. Product Compare Agent
5. Product Book Agent
6. Product Negotiate Agent
7. Market Trends Agent

This is for a demo, so

1. Create the multi-agent system in 1 python file.
2. Use the Google ADK Library for the agents.
3. Refer the llms-full.txt file for more details on the Google ADK agent.
4. Use Gemini 2.5 Pro for the agents.
5. For each of the API's create a separate FASTAPI server with the methods for all API's in the same file.

For testing,

1. Create a shell script that will run the API's and the multi-agent system.
2. The shell script should run the API's first and then the multi-agent system.
3. The multi-agent system should run in a separate process from the API's.
4. The shell script should wait for the API's to start and then start the multi-agent system.
5. The shell script will use the adk web command to start the multi-agent system.
