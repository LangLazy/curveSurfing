from flask import Flask
import datetime as dt
from efficientFrontier import EfficientFrontier

app = Flask(__name__)

@app.route("/<stocks>/<numSims>/<start>/<end>")
def index(stocks, numSims, start, end):
    stocks = stocks.split("+")
    sstocks = ['AAPL','FB', 'C', 'DIS']
    end = dt.datetime.strptime(end, "%Y-%m-%d").date()
    start =  dt.datetime.strptime(start, "%Y-%m-%d").date()
    e = EfficientFrontier(sstocks,  start, end)
    e.generateFrontier(int(numSims))
    obj = e.frontierToJson()
    return obj