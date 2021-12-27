import matplotlib.pyplot as plt
from pandas_datareader import data as pdr
import numpy as np
import json
import datetime as dt
import matplotlib.pyplot as plt
plt.style.use('seaborn-colorblind')  

class EfficientFrontier:
    def __init__(self, stocks: list[str], startDate: dt.time, endDate: dt.time):
        self.dailyPctChange = pdr.get_data_yahoo(stocks, startDate, endDate)['Close'].pct_change()
        riskFreeData = pdr.get_data_fred('GS10')
        self.riskFreeRate = riskFreeData.iloc[-1]["GS10"]/100
        self.meanDailyReturns = self.dailyPctChange.mean()
        self.covMatrix = self.dailyPctChange.cov()
        self.start = dt.datetime.strftime(startDate,"%Y-%m-%d")
        self.end = dt.datetime.strftime(endDate,"%Y-%m-%d")
        self.stocks = stocks
        self.returns = []
        self.weights = []
        self.volatility = []
        self.sharpeRatio = []
        self.numSimulations = 0
        self.personalPort = 0
    def generateWeightings(self, numSimulations: int):
        for _ in range(numSimulations):
            tmp = np.random.random(len(self.stocks))
            curWeight = tmp / sum(tmp)
            self.weights.append(curWeight)
    def generateFrontier(self, numSimulations: int):
        self.returns = []
        self.numSimulations = numSimulations
        self.weights = []
        self.volatility = []
        self.sharpeRatio = []
        self.generateRiskReturn(numSimulations)
    def displayFrontier(self):
        mSharpeIndex = self.sharpeRatio.index(max(self.sharpeRatio))
        plt.figure(figsize=(16, 9))
        plt.scatter(self.volatility,self.returns,c=self.sharpeRatio, cmap='cool',s=8, alpha=0.3)
        plt.colorbar()
        plt.title(f'Efficient Frontier Generated from {self.numSimulations} Simulated Random portfolios')
        plt.xlabel('Annual Volatility/Standard Deviation')
        plt.ylabel('Annual Veturns')
        plt.legend(labelspacing=1.5)
        plt.scatter(self.volatility[mSharpeIndex], self.returns[mSharpeIndex], marker='x',color='r',s=100,alpha=.9, label='Maximum Sharpe ratio')
        if self.personalPort:
            plt.scatter(self.personalPort[0], self.personalPort[1], marker='x',color='g',s=100,alpha=.9, label='Your Portfolio')
        plt.legend()
        plt.show()
    def frontierToJson(self):
        mSharpeIndex = self.sharpeRatio.index(max(self.sharpeRatio))
        obj = {
            "stocks": self.stocks,
            "numberPortfolios": self.numSimulations,
            "allPortfolioReturns":self.returns,
            "allPortfolioVolatility": self.volatility,
            "startDate": self.start,
            "endDate": self.end,
            "riskfreeRate": self.riskFreeRate,
            "optimalSharpe":{
                "weights": np.ndarray.tolist(self.weights[mSharpeIndex]),
                "returns": self.returns[mSharpeIndex],
                "volatility": self.volatility[mSharpeIndex]
            },
            "personalPortfolio": self.personalPort
        }
        return json.dumps(obj)
    def generateRiskReturn(self, numSimulations: int):
        self.generateWeightings(numSimulations)
        for weight in self.weights:
            annualReturns = np.dot(weight, self.meanDailyReturns) * 252
            self.returns.append(annualReturns)
            annualVolatility = np.sqrt(np.dot(weight.T,np.dot(self.covMatrix, weight)))* np.sqrt(252)
            self.volatility.append(annualVolatility)
            self.sharpeRatio.append((annualReturns - self.riskFreeRate)/annualVolatility)
    def computePersonalRiskReturn(self, weights=None, meanReturnOnStocks=None, returnOnPortfolio=None, volatilityOfPortfolio: int = None):
        if weights != None:
            weights = np.array(weights)
            if meanReturnOnStocks != None:
                meanReturnOnStocks = np.array(meanReturnOnStocks)
                self.personalPort = (np.sqrt(np.dot(weights.T,np.dot(self.covMatrix, weights)))* np.sqrt(252), np.dot(weights, meanReturnOnStocks) * 252)
            else:
                self.personalPort = (np.sqrt(np.dot(weights.T,np.dot(self.covMatrix, weights)))* np.sqrt(252), np.dot(weights, self.meanDailyReturns) * 252)
        elif returnOnPortfolio != None and volatilityOfPortfolio != None:
            self.personalPort = (volatilityOfPortfolio, returnOnPortfolio)


# stocks = ['AAPL','FB', 'C', 'DIS']
# end = dt.date.today()
# start = end - dt.timedelta(days=365)
# # e = EfficientFrontier(stocks, start, end)
# # e.computePersonalRiskReturn(weights=[.4,.4,.1,.1], meanReturnOnStocks=[.2/100, -.5/100, .9/100, .001/100])
# # e.generateFrontier(100000)
# # e.displayFrontier()
