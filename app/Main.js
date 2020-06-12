const currencies = ["EUR", "GBP", "USD"];

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Select from "react-select";
import LoadingIcon from "./components/LoadingIcon";

const apiUrl = "https://api.coindesk.com/v1/bpi/currentprice.json";

function InputBTC(props) {
  return (
    <input
      type="number"
      placeholder="BTC"
      min="0"
      max="1000000000"
      onChange={e => {
        if (e.target.value < 1000000000) props.setAmount(e.target.value);
        else {
          e.target.value = 999999999;
          props.setAmount(e.target.value);
        }

        if (e.target.value < 0) {
          e.target.value = 0;
          props.setAmount(e.target.value);
        }
      }}
    ></input>
  );
}

function Main() {
  const [showEur, setShowEur] = useState(true);
  const [showGbp, setShowGbp] = useState(true);
  const [showUsd, setShowUsd] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  function OutputValues(props) {
    async function handleDelete(currency) {
      switch (currency) {
        case "EUR":
          setShowEur(false);
          setCurrencyList(prev => prev.concat({ value: "EUR", label: "EUR" }));
          break;
        case "GBP":
          setShowGbp(false);
          setCurrencyList(prev => prev.concat({ value: "GBP", label: "GBP" }));
          break;
        case "USD":
          setShowUsd(false);
          setCurrencyList(prev => prev.concat({ value: "USD", label: "USD" }));
          break;
      }
    }

    let outputEur = (props.eurRate * props.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    let outputGbp = (props.gbpRate * props.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    let outputUsd = (props.usdRate * props.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (isLoading) {
      return <LoadingIcon />;
    }

    return (
      <>
        {showEur ? (
          <div className="currency">
            <p>
              <span>€</span>
              {outputEur}
            </p>
            <div className="close-button" onClick={() => handleDelete(currencies[0])}>
              X
            </div>
          </div>
        ) : (
          ""
        )}

        {showGbp ? (
          <div className="currency">
            <span>£</span>
            {outputGbp}
            <div className="close-button" onClick={() => handleDelete(currencies[1])}>
              X
            </div>
          </div>
        ) : (
          ""
        )}

        {showUsd ? (
          <div className="currency">
            <span>$</span>
            {outputUsd}
            <div className="close-button" onClick={() => handleDelete(currencies[2])}>
              X
            </div>
          </div>
        ) : (
          ""
        )}
      </>
    );
  }

  function CurrencyList() {
    function handleAdd() {
      let array = [];
      let outputArray = [];
      let index = 0;
      switch (selectedCurrency.value) {
        case "EUR":
          setShowEur(true);
          array = currencyList;
          outputArray = array.filter(el => el.value != "EUR");
          setCurrencyList(outputArray);

          setSelectedCurrency("EUR");
          break;
        case "GBP":
          setShowGbp(true);
          array = currencyList;
          outputArray = array.filter(el => el.value != "GBP");
          setCurrencyList(outputArray);
          setSelectedCurrency("GBP");
          break;
        case "USD":
          setShowUsd(true);
          array = currencyList;
          outputArray = array.filter(el => el.value != "USD");
          setCurrencyList(outputArray);
          setSelectedCurrency("USD");
          break;
      }
    }
    useEffect(() => {
      if (showEur && showGbp && showUsd) {
        setDisableSelect(true);
      } else setDisableSelect(false);
    }, [showEur, showGbp, showUsd]);
    return (
      <>
        <Select value={selectedCurrency} onChange={e => setSelectedCurrency(e)} options={currencyList} isDisabled={disableSelect} placeholder="Valiuta" />

        <button onClick={handleAdd} disabled={disableSelect}>
          Pridėti valiutą
        </button>
      </>
    );
  }

  useEffect(() => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        setEurRate(parseFloat(data.bpi.EUR.rate.replace(/,/g, "")));
        setGbpRate(parseFloat(data.bpi.GBP.rate.replace(/,/g, "")));
        setUsdRate(parseFloat(data.bpi.USD.rate.replace(/,/g, "")));
      })
      .catch(e => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true);
      fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
          setIsLoading(false);
          setEurRate(parseFloat(data.bpi.EUR.rate.replace(/,/g, "")));
          setGbpRate(parseFloat(data.bpi.GBP.rate.replace(/,/g, "")));
          setUsdRate(parseFloat(data.bpi.USD.rate.replace(/,/g, "")));
        })
        .catch(e => {
          console.log(e);
        });
    }, 1000 * 60);

    return () => clearInterval(interval);
  });

  const [amount, setAmount] = useState(0);
  const [eurRate, setEurRate] = useState(0);
  const [gbpRate, setGbpRate] = useState(0);
  const [usdRate, setUsdRate] = useState(0);
  const [disableSelect, setDisableSelect] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState();
  const [currencyList, setCurrencyList] = useState([]);

  return (
    <>
      <div className="title">
        <h2>BTC kurso keitimo skaičiuoklė</h2>
      </div>
      <div className="input">
        <InputBTC setAmount={setAmount} />
      </div>
      <div className="currency__block">
        <OutputValues amount={amount} eurRate={eurRate} gbpRate={gbpRate} usdRate={usdRate} />
      </div>
      <div className="currencylist">
        <CurrencyList />
      </div>
    </>
  );
}

ReactDOM.render(<Main />, document.querySelector("#app"));
