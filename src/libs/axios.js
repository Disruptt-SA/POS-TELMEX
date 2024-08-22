import axios from 'axios'

/* RAILWAY TELMEX DEMO */
const url_api = import.meta.env.VITE_APP_URL_API_TELMEX_DEMO

/* LOCAL API SERVE */
//const url_api = import.meta.env.VITE_APP_URL_API_PROD_SER

const api = axios.create({
	baseURL: url_api
})

export default api