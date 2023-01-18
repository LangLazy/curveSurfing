import matplotlib.pyplot as plt
from pandas_datareader import data as pdr
import numpy as np
import json
import datetime as dt
from imagekitio import ImageKit
import Constants
import yfinance as yf
yf.pdr_override()

plt.style.use('seaborn-colorblind')  
class EfficientFrontier:
    #Constructor
    def __init__(self, stocks: list[str], startDate: dt.time, endDate: dt.time, riskFreeRate, personalWeights):
        try:
            self.dailyPctChange = yf.download(stocks, startDate, endDate)['Close'].pct_change()
            self.meanDailyReturns = self.dailyPctChange.mean()
            self.covMatrix = self.dailyPctChange.cov()
            if riskFreeRate != None:
                self.riskFreeRate = riskFreeRate
            else:
                self.riskFreeData = pdr.get_data_fred('GS10')
                self.riskFreeRate = self.riskFreeData.iloc[-1]["GS10"]/100
            if personalWeights != []:
                self.personalPort = personalWeights
            else:
                self.personalPort = []
            self.start = dt.datetime.strftime(startDate,"%Y-%m-%d")
            self.end = dt.datetime.strftime(endDate,"%Y-%m-%d")
            self.stocks = stocks
        except Exception as e:
            print("Exception: ", e)
            

    #Public API Methods
    def generateFrontier(self, numSimulations: int):
        self.returns = []
        self.numSimulations = numSimulations
        self.weights = []
        self.volatility = []
        self.sharpeRatio = []
        self.__generateRiskReturn(numSimulations)
        self.__computePersonalRiskReturn()
        self.__constructFrontier()
    def frontierToJson(self):
        mSharpeIndex = self.sharpeRatio.index(max(self.sharpeRatio))
        imagekit = ImageKit(
            public_key=Constants.IMAGE_KIT_PUBLIC_KEY_API,
            private_key=Constants.IMAGE_KIT_PRIVATE_KEY_API,
            url_endpoint = 'https://upload.imagekit.io/api/v1/files/upload'
            )
        upload = imagekit.upload(
            file=open("output.png", "rb"),
            file_name="output.png", 
        )
        obj = {
            "stocks": self.stocks,
            "numberPortfolios": self.numSimulations,
            "startDate": self.start,
            "endDate": self.end,
            "riskfreeRate": self.riskFreeRate,
            "optimalSharpe":{
                "weights": np.ndarray.tolist(self.weights[mSharpeIndex]),
                "returns": self.returns[mSharpeIndex],
                "volatility": self.volatility[mSharpeIndex],
                "sharpeVal": self.sharpeRatio[mSharpeIndex]
            },
            "personalPortfolio": {
                "return": self.personalResults[1],
                "volatility": self.personalResults[0]
            },
            "img": upload["response"]["url"]
        }
        return json.dumps(obj)

    #Private Class Methods
    def __generateWeightings(self, numSimulations: int):
        for _ in range(numSimulations):
            tmp = np.random.random(len(self.stocks))
            curWeight = tmp / sum(tmp)
            self.weights.append(curWeight)

    def __constructFrontier(self):
        mSharpeIndex = self.sharpeRatio.index(max(self.sharpeRatio))
        plt.figure(figsize=(16, 9))
        plt.scatter(self.volatility,self.returns,c=self.sharpeRatio, cmap='cool',s=8, alpha=0.3)
        plt.title(f'Efficient Frontier Generated from {self.numSimulations} Simulated Random portfolios')
        plt.xlabel('Annual Volatility/Standard Deviation')
        plt.ylabel('Annual Returns')
        plt.colorbar(label='Sharpe ratio')
        plt.legend(labelspacing=1.5)
        plt.scatter(self.volatility[mSharpeIndex], self.returns[mSharpeIndex], marker='x',color='r',s=100,alpha=.9, label='Maximum Sharpe ratio')
        if self.personalPort:
            plt.scatter(self.personalPort[0], self.personalPort[1], marker='x',color='g',s=100,alpha=.9, label='Your Portfolio')
        plt.legend()
        plt.savefig("output",bbox_inches='tight')

    def __generateRiskReturn(self, numSimulations: int):
        self.__generateWeightings(numSimulations)
        for weight in self.weights:
            annualReturns = np.dot(weight, self.meanDailyReturns) * 252
            self.returns.append(annualReturns)
            annualVolatility = np.sqrt(np.dot(weight.T,np.dot(self.covMatrix, weight)))* np.sqrt(252)
            self.volatility.append(annualVolatility)
            self.sharpeRatio.append((annualReturns - self.riskFreeRate)/annualVolatility)

    def __computePersonalRiskReturn(self):
        self.personalResults = [None, None]
        if self.personalPort != []:
            weights = np.array(self.personalPort)
            self.personalResults = [np.sqrt(np.dot(weights.T,np.dot(self.covMatrix, weights)))* np.sqrt(252), np.dot(weights, self.meanDailyReturns) * 252]


# stocks = ['AAPL','FB', 'C', 'DIS']
# end = dt.date.today()
# start = end - dt.timedelta(days=365)
# e = EfficientFrontier(stocks, start, end)
# print(e.riskFreeData)

# # e.computePersonalRiskReturn(weights=[.4,.4,.1,.1], meanReturnOnStocks=[.2/100, -.5/100, .9/100, .001/100])
# e.generateFrontier(10000)
# e.displayFrontier()

