from flask import Flask
import datetime as dt
from efficientFrontier import EfficientFrontier
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)

@app.route("/<stocks>/<numSims>/<start>/<end>", defaults={'personalWeights': "", 'riskFreeRate': ""})
@app.route("/<stocks>/<numSims>/<start>/<end>/<personalWeights>", defaults={'riskFreeRate': ""})
@app.route("/<stocks>/<numSims>/<start>/<end>/<personalWeights>/<riskFreeRate>")
@app.route("/<stocks>/<numSims>/<start>/<end>/r/<riskFreeRate>", defaults={'personalWeights': ""})
def index(stocks, numSims, start, end, personalWeights, riskFreeRate):
    e = parseFields(stocks, numSims, start, end, personalWeights, riskFreeRate)
    obj = e.frontierToJson()
    return obj

def parseFields(stockStr, numSimStr, startStr, endStr, personalWeightsStr, riskFreeRateStr) -> EfficientFrontier:
    stocks = stockStr.split("+")
    end = dt.datetime.strptime(endStr, "%Y-%m-%d").date()
    start =  dt.datetime.strptime(startStr, "%Y-%m-%d").date()
    personalWeights = []
    rfr = None
    if personalWeightsStr != "":
        tmp = personalWeightsStr.split("+")
        for elm in tmp:
            personalWeights.append(float(elm)/100)
    if riskFreeRateStr != "":
        rfr = float(riskFreeRateStr)/100
    e = EfficientFrontier(stocks,  start, end, rfr, personalWeights)
    e.generateFrontier(int(numSimStr))
    return e