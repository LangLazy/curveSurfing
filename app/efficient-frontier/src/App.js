import React, { useState, useRef } from 'react'
import Axios from 'axios'
import { ThemeProvider, createTheme, Typography, Grid, TextField, Link } from '@mui/material';
import LoadingButton from '@material-ui/lab/LoadingButton';

import Alert from '@mui/material/Alert';
function App() {
  const stateObj = {
    stocks: "AAPL,DIS,C",
    numberPortfolios: "10000",
    startDate: "2020-12-28",
    endDate: "2021-12-28",
    riskfreeRate: "1.767",
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
      stcks: false,
      rfr: false
    }
  }
  const [fieldState, changeFieldState] = useState(stateObj)
  const errorState = useRef(errorObj)
  const [graphDisplayed, changeGraphState] = useState(false)
  const [loadingState, changeLoadingState] = useState(false)
  const [graphData, setGraphData] = useState([])
  const [warningClosed, setWarning] = useState(false)
  const [errorStatus, setStatus] = useState(false)
  const onSubmit = (e) => {
    e.preventDefault();
    validateInputs()
    if (! (errorState.current["textError"]["startDate"] || errorState.current["textError"]["rfr"]||errorState.current["textError"]["endDate"] ||errorState.current["textError"]["numberPortfolios"] || errorState.current["textError"]["stcks"])) {
      setStatus(false)
      const stockString1 = fieldState["stocks"].replaceAll(",", "+")
      const stockString = stockString1.replaceAll(" ", "")
      const apiEndPoint = "https://efficientfrontier.pythonanywhere.com/" + stockString + "/" + fieldState["numberPortfolios"] + "/" + fieldState["startDate"] + "/" + fieldState["endDate"]+"/r/"+fieldState["riskfreeRate"]
      getData(apiEndPoint)
      
    }
    else{
      setStatus(true)
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
        stcks: false,
        rfr: false
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
    else if (parseInt(fieldState["numberPortfolios"]) < 100 || parseInt(fieldState["numberPortfolios"]) > 100000 ) {
      newErrorState["errorMessage"].push("Ensure a valid natural number (100 <= x <= 100000) is entered for the number of simulated portfolios")
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
    const tmpRfr = fieldState["riskfreeRate"].replaceAll("%","")
    if (isNaN(tmpRfr)){
      newErrorState["errorMessage"].push("Please enter a valid risk free rate (%)")
    }
    errorState.current = newErrorState
  }
  const getData = async (apiEndPoint) => {
    changeLoadingState(true)
    setWarning(true)
    const data = await Axios.get(apiEndPoint)
    changeGraphState(true)
    setGraphData(data["data"]["img"])
    changeLoadingState(false)
  }

  const onType = (e) => {
    const { name, value } = e.target
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
        <Grid item sx={{ m: 4.1 }}>
          <Typography variant="h4" color="black">
            Equity Efficient Frontier Generator
          </Typography>
        </Grid>
        <Grid item >
          <Grid container direction="column" alignItems="center" justify="center">
            <Grid item>
              <div>
                {graphDisplayed
                  ? <img src={graphData} alt="Logo" height="540" width="960"></img>
                  : <div></div>
                }
              </div>
            </Grid>
            <Grid
              item
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
                  {...(errorState.current["textError"]["numberPortfolios"] && {error:true})}
                  />
                  <TextField onChange={onType}
                  
                  value={fieldState["riskfreeRate"]}
                  label="Risk Free Rate for Period (%)"
                  name="riskfreeRate" 
                  {...(errorState.current["textError"]["rfr"] && {error:true})}
                  />
                <TextField onChange={onType}
                  value={fieldState["startDate"]}
                  type="date"
                  label="Equity Acquisition Date"
                  name="startDate" 
                  {...(errorState.current["textError"]["startDate"] && {error:true})}
                  />
                <TextField onChange={onType}
                  value={fieldState["endDate"]}
                  type="date"
                  label="Simmulation End Date"
                  name="endDate" 
                  {...(errorState.current["textError"]["endDate"] && {error:true})}
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
                  {...(errorState.current["textError"]["stcks"] && {error:true})}
                  />

              </Grid>
              <Grid item textAlign='center'
                sx={{
                  '& .MuiButton-root': { m: 2, fontSize: '15px' },
                }}
              >
                {! warningClosed 
                ? <Alert sx={{ m: .5 }} severity="info" onClose={() => {setWarning(true)}}>This App Requires JavaScript to run correctly</Alert>
                : <div></div>}
                {! loadingState 
                ? <div></div>
                : <Alert severity="success">Request sent! The larger the # of Simulations, the longer it might take, so hold on!</Alert>}
                {errorState.current.errorMessage.map((msg)=>(<Alert sx={{ m: .5 }}severity="error">{msg}</Alert>))}
                <LoadingButton loading={loadingState} type='submit' variant='outlined' color='secondary'>
                  Generate Frontier
                </LoadingButton>
              </Grid>
              
            </Grid>
          </Grid>
        </Grid>
        <Link href="https://rahulg.me/" variant="body2">
           {'Created by Rahul Gudise'}
        </Link>
      </Grid>
    </ThemeProvider>
  );
}

export default App;
