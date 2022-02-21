import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import store from './app/store'
import { Provider } from 'react-redux'

window.RenderApp = (config) => {
    ReactDOM.render(
        <Provider store={store}>
            <App _config={config} />
        </Provider>,
        document.getElementById('root')
    )
}

/*
window.RenderApp = (config) => {
    ReactDOM.render(
        <React.StrictMode>
            <Provider store={store}>
                <App _config={config} />
            </Provider>
        </React.StrictMode>,
        document.getElementById('root')
    )
}
*/