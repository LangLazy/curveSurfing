import React, { useState } from 'react'
import Axios from 'axios'
import { ThemeProvider, createTheme, Typography, Grid, Button, TextField } from '@mui/material';
import Alert from '@mui/material/Alert';
//https://www.youtube.com/watch?v=5jbdkOlf4cY
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
  const errorObj = {
    errorState: false,
    errorMessage: [],
    textError: {
      startDate: false,
      endDate: false,
      numberPortfolios: false,
      stcks: false
    }
  }
  const [fieldState, changeFieldState] = useState(stateObj)
  const [errorState, changeErrorState] = useState(errorObj)
  const [graphDisplayed, changeGraphState] = useState(false)
  const [graphData, setGraphData] = useState([])
  const onSubmit = (e) => {
    e.preventDefault();
    validateInputs()
    if (! (errorState["textError"]["startDate"] || errorState["textError"]["endDate"] ||errorState["textError"]["numberPortfolios"] || errorState["textError"]["stcks"])) {
      const stockString1 = fieldState["stocks"].replaceAll(",", "+")
      const stockString = stockString1.replaceAll(" ", "")
      const apiEndPoint = "http://localhost:5000/" + stockString + "/" + fieldState["numberPortfolios"] + "/" + fieldState["startDate"] + "/" + fieldState["endDate"]
      console.log(apiEndPoint)
      getData(apiEndPoint)
    }
    else{
      console.log("error encountered")
    }
  }

  const validateInputs = () => {
    var newErrorState = {
      errorState: false,
      errorMessage: [],
      textError: {
        startDate: false,
        endDate: false,
        numberPortfolios: false,
        stcks: false
      }
    }
    const oneYear = (1000 * 3600 * 24)
    const endDate = Date.parse(fieldState["endDate"])
    const startDate = Date.parse(fieldState["startDate"])
    const today = Date.now()
    if (isNaN(fieldState["numberPortfolios"])) {
      newErrorState["errorMessage"].push("Ensure a valid natural number (>= 100) is entered for the number of simulated portfolios")
      newErrorState["textError"]["numberPortfolios"] = true
    }
    else if (parseInt(fieldState["numberPortfolios"]) < 100) {
      newErrorState["errorMessage"].push("Ensure a valid natural number (>= 100) is entered for the number of simulated portfolios")
      newErrorState["textError"]["numberPortfolios"] = true
    }
    else if (fieldState["numberPortfolios"].indexOf('.') !== -1) {
      newErrorState["errorMessage"].push("Ensure a valid whole number (>= 100) and not a floating point decimal is entered for the number of simulated portfolio")
      newErrorState["textError"]["numberPortfolios"] = true
    }

    if (endDate > today){
      newErrorState["errorMessage"].push("Please have the end date not be in the future")
      newErrorState["textError"]["endDate"] = true
    }
    if (startDate > today){
      newErrorState["errorMessage"].push("Please have the start date not be in the future")
      newErrorState["textError"]["startDate"] = true
    }
    if (endDate - startDate < oneYear) {
      newErrorState["errorMessage"].push("Please ensure that the start date occours at least 1 YR BEFORE the end date specified")
      newErrorState["textError"]["startDate"] = true
    }
    const stcks = fieldState["stocks"].split(",")
    if (stcks.length <= 1) {
      newErrorState["errorMessage"].push("Ensure that at least 2 unique stocks have been entered seperated by only commas")
      newErrorState["textError"]["stcks"] = true
    }
    changeErrorState(newErrorState)
    // if (fieldState["riskfreeRate"] !== "" && isNaN(fieldState["riskfreeRate"])) {
    //   changeErrState("Ensure a valid risk free rate (%) is entered")
    //   return false
    // }
    // if (fieldState["personalPort"]["stockWeights"] !== "") {
    //   const wts = fieldState["personalPort"]["stockWeights"].split(",")
    //   if (wts.len !== stcks.length) {
    //     changeErrState("Ensure the amount of weights entered in the comma seperated list matches the number of stocks entered")
    //     return false
    //   }
    //   var sum = 0.0
    //   for (const val of wts) {
    //     if (isNaN(val)) {
    //       changeErrState("Ensure all weights entered (%) are valid")
    //       return false
    //     }
    //     else {
    //       sum = sum + Number(val)
    //       if (sum > 100.00) {
    //         changeErrState("Ensure the sum of the weights entered equals to 100%")
    //         return false
    //       }
    //     }
    //   }
    // }
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
  const theme = createTheme({
    palette: {
      primary: {
        main: "#00BFFF",
      },
      secondary: {
        main: "#6f00ff",
      },
    },
  });
  //ensure stocks are on nasdaq or nyse
  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '100vh' }}

      >
        <Grid item sx={{ m: 5 }}>
          <Typography variant="h4" color="black">
            Equity Efficient Frontier Generator
          </Typography>
        </Grid>
        <Grid item >
          <Grid container container direction="column" alignItems="center" justify="center">

            <Grid item>
              <div>
                {graphDisplayed
                  ? <img src={graphData} alt="Logo" height="630" width="1120"></img>
                  : <div></div>
                }
              </div>
            </Grid>
            <Grid
              item
              // style={{ backgroundColor: "red" }}
              component="form"
              onSubmit={onSubmit}
              noValidate
              autoComplete="off"
            >
              <Grid
                item
                sx={{
                  '& .MuiTextField-root': { m: 1 },
                }}
              >
                <TextField 
                  onChange={onType}
                  value={fieldState["numberPortfolios"]}
                  label="# Simulations/Portfolios"
                  name="numberPortfolios" 
                  {...(errorState["textError"]["numberPortfolios"] && {error:true})}
                  />
                <TextField onChange={onType}
                  value={fieldState["startDate"]}
                  type="date"
                  label="Equity Acquisition Date"
                  name="startDate" 
                  {...(errorState["textError"]["startDate"] && {error:true})}
                  />
                <TextField onChange={onType}
                  value={fieldState["endDate"]}
                  type="date"
                  label="Simmulation End Date"
                  name="endDate" 
                  {...(errorState["textError"]["endDate"] && {error:true})}
                  />
              </Grid>
              <Grid
                item
                sx={{
                  '& .MuiTextField-root': { m: 1 },
                }}
              >
                <TextField onChange={onType}
                  fullWidth
                  value={fieldState["stocks"]}
                  label="NYSE/NASDAQ Equities"
                  name="stocks" 
                  {...(errorState["textError"]["stcks"] && {error:true})}
                  />
              </Grid>
              <Grid item textAlign='center'
                sx={{
                  '& .MuiButton-root': { m: 2, fontSize: '15px' },
                }}
              >
                <Button type='submit' variant='outlined' color='secondary'>
                  Generate Frontier
                </Button>
              </Grid>
              {errorState.errorMessage.map((msg)=>(<Alert severity="error">{msg}</Alert>))}
              {/* <Grid item>
                {errState === ""
                  ?  <div></div>
                  : <Alert severity="error">{errState}</Alert>
                }                
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App;
