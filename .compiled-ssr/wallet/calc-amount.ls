require! {
    \./math.ls : { times, minus, plus, div }
    \mobx : { toJS, transaction }
    \./api.ls : { calc-fee }
}
export calc-crypto = (store, amount-send-usd)->
    return \0 if not amount-send-usd?
    { send } = store.current
    { wallet } = send
    { token } = send.coin
    usd-rate = wallet?usd-rate ? 0
    amount-send-usd `div` usd-rate
export calc-usd = (store, amount-send)->
    return \0 if not amount-send?
    { send } = store.current
    { wallet } = send
    { token } = send.coin
    usd-rate = wallet?usd-rate ? 0
    amount-send `times` usd-rate
export change-amount = (store, amount-send)->
    { send } = store.current
    { wallet } = send
    { token } = send.coin
    #return if not send.wallet
    return send.error = "Balance is not loaded" if not wallet?
    result-amount-send = amount-send ? 0
    err, calced-fee <- calc-fee { token, send.network, amount: result-amount-send }
    return send.error = "Calc Fee Error: #{err.message ? err}" if err?
    tx-fee = calced-fee ? send.network.tx-fee
    usd-rate = wallet?usd-rate ? 0
    <- transaction
    send.amount-send = amount-send ? ""
    send.value = result-amount-send `times` (10 ^ send.network.decimals)
    send.amount-obtain = result-amount-send
    send.amount-obtain-usd = send.amount-obtain `times` usd-rate
    send.amount-send-usd = calc-usd store, amount-send
    send.amount-send-fee = tx-fee
    send.amount-charged =  
        | (result-amount-send ? "").length is 0 => tx-fee
        | result-amount-send is \0 => tx-fee
        | result-amount-send is 0 => tx-fee
        | _ => result-amount-send `plus` tx-fee
    send.amount-charged-usd =  send.amount-charged `times` usd-rate
    send.amount-send-fee-usd = tx-fee `times` usd-rate
    balance = 
        | wallet.balance is \... => 0
        | _ => wallet.balance
    send.error = 
        if parse-float(balance `minus` result-amount-send) < 0
        then "Not Enough Funds"
        else ""