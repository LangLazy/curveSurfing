import React, { useState } from 'react'
import Axios from 'axios'
import { Grid, Container, Button, Box, TextField } from '@mui/material';

function App() {
  const stateObj = {
    stocks: "AAPL,DIS,FB,C",
    numberPortfolios: "10000",
    startDate: "2020-12-28",
    endDate: "2021-12-28",
    riskfreeRate: "",
    personalPort: {
      return: "0",
      volatility: "0",
      stockWeights: ""
    }
  }
  const [fieldState, changeFieldState] = useState(stateObj)
  const [errState, changeErrState] = useState("")
  const [graphDisplayed, changeGraphState] = useState(false)
  const [graphData, setGraphData] = useState([])
  const onSubmit = (e) => {
    e.preventDefault();
    const valid = validateInputs()
    if (valid) {
      changeErrState(false)
      const stockString = fieldState["stocks"].replaceAll(",", "+")
      const apiEndPoint = "http://localhost:5000/" + stockString + "/" + fieldState["numberPortfolios"] + "/" + fieldState["startDate"] + "/" + fieldState["endDate"]
      console.log(apiEndPoint)
      getData(apiEndPoint)
    }
  }
  const validateInputs = () => {
    const oneYear = (1000 * 3600 * 24)
    const endDate = Date.parse(fieldState["endDate"])
    const startDate = Date.parse(fieldState["startDate"])
    if (endDate - startDate < oneYear) {
      changeErrState("Please ensure that the start date occours is 1 YR BEFORE the end date specified")
      return false
    }
    if (isNaN(fieldState["numberPortfolios"])) {
      changeErrState("Ensure a valid natural number (>= 100) is entered for the number of simulated portfolios")
      return false
    }
    else if (parseInt(fieldState["numberPortfolios"]) < 100) {
      changeErrState("Ensure a valid natural number (>= 100) is entered for the number of simulated portfolios")
      return false
    }
    else if (fieldState["numberPortfolios"].indexOf('.') !== -1) {
      changeErrState("Ensure a valid whole number (>= 100) and not a floating point decimal is entered for the number of simulated portfolio")
      return false
    }
    if (fieldState["riskfreeRate"] !== "" && isNaN(fieldState["riskfreeRate"])) {
      changeErrState("Ensure a valid risk free rate (%) is entered")
      return false
    }
    const stcks = fieldState["stocks"].split(",")
    if (stcks.length <= 1) {
      changeErrState("Ensure that at least 2 unique stocks have been entered seperated by only commas")
      return false
    }
    if (fieldState["personalPort"]["stockWeights"] !== "") {
      const wts = fieldState["personalPort"]["stockWeights"].split(",")
      if (wts.len !== stcks.length) {
        changeErrState("Ensure the amount of weights entered in the comma seperated list matches the number of stocks entered")
        return false
      }
      var sum = 0.0
      for (const val of wts) {
        if (isNaN(val)) {
          changeErrState("Ensure all weights entered (%) are valid")
          return false
        }
        else {
          sum = sum + Number(val)
          if (sum > 100.00) {
            changeErrState("Ensure the sum of the weights entered equals to 100%")
            return false
          }
        }
      }
    }
    return true
    //check if stocks are valid (server side)
  }
  const getData = async (apiEndPoint) => {
    console.log("here")
    const data = await Axios.get(apiEndPoint)
    console.log(data)
    changeGraphState(true)
    console.log(data["data"]["img"])
    setGraphData(data["data"]["img"])
  }

  const onType = (e) => {
    const { name, value } = e.target
    console.log(name, value)
    changeFieldState({
      ...fieldState,
      [name]: value
    })
  }

  //ensure stocks are on nasdaq or nyse
  return (
    <Container
      justifyContent="center"
      maxWidth="md"
      style={{ backgroundColor: "skyblue" }}
      sx={{
        height: '100vh'
      }}
      
    >
      <div>
        {errState === ""
          ? <div></div>
          : <div>{errState}</div>
        }
      </div>

      <div>
        {graphDisplayed
          ? <img src={graphData} alt="Logo" ></img>
          : <div></div>
        }
      </div>
      <Box
        style={{ backgroundColor: "red" }}
        component="form"
        onSubmit={onSubmit}
        noValidate
        autoComplete="off"
      >
        <Box
          sx={{
            '& .MuiTextField-root': { m: 2 },
          }}
          display="flex" justifyContent="center" alignItems="center"
        >
          <TextField onChange={onType}
            value={fieldState["numberPortfolios"]}
            label="# Simulations/Portfolios"
            name="numberPortfolios" />
          <TextField onChange={onType}
            value={fieldState["startDate"]}
            type="date"
            label="Equity Acquisition Date"
            name="startDate" />
          <TextField onChange={onType}
            value={fieldState["endDate"]}
            type="date"
            label="Simmulation End Date"
            name="endDate" />
        </Box>
        <Box
          sx={{
            '& .MuiTextField-root': { m: 1 },
          }}
        >
          <TextField onChange={onType}
            fullWidth
            value={fieldState["stocks"]}
            label="NYSE/NASDAQ Equities"
            name="stocks" />
        </Box>
        <Box textAlign='center'
          sx={{
            '& .MuiButton-root': { m: 2 },
          }}
        >
          <Button type='submit' variant='outlined' color='secondary'>
            Generate Frontier
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
