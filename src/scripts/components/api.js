const API_TOKEN = import.meta.env.VITE_API_TOKEN
const GROUP_ID = import.meta.env.VITE_GROUP_ID
const BASE_URL = import.meta.env.VITE_BASE_URL

const config = {
	baseUrl: `${BASE_URL}/${GROUP_ID}`,
	headers: {
		authorization: API_TOKEN,
		'Content-Type': 'application/json',
	},
}

const sleep = ms => new Promise(res => setTimeout(res, ms))

const getResponseData = res => {
	return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`)
}

export const getUserInfo = async () => {
	return fetch(`${config.baseUrl}/users/me`, {
		headers: config.headers,
	}).then(getResponseData)
}

export const getCardList = async () => {
	return fetch(`${config.baseUrl}/cards`, {
		headers: config.headers,
	}).then(getResponseData)
}


export const setUserAvatar = async ({ avatar }) => {
	await sleep(1000)
	return fetch(`${config.baseUrl}/users/me/avatar`, {
		method: 'PATCH',
		headers: config.headers,
		body: JSON.stringify({
			avatar,
		}),
	}).then(getResponseData)
}

export const setUserInfo = async ({ name, about }) => {
	await sleep(1000)
	return fetch(`${config.baseUrl}/users/me`, {
		method: 'PATCH',
		headers: config.headers,
		body: JSON.stringify({
			name,
			about,
		}),
	}).then(getResponseData)
}

export const createNewCard = async ({ name, link }) => {
	await sleep(1000)
	return fetch(`${config.baseUrl}/cards`, {
		method: 'POST',
		headers: config.headers,
		body: JSON.stringify({
			name,
			link,
		}),
	}).then(getResponseData)
}

export const deleteCard = async cardId => {
	return fetch(`${config.baseUrl}/cards/${cardId}`, {
		method: 'DELETE',
		headers: config.headers,
	}).then(getResponseData)
}

export const likeCard = async (cardId, isLiked) => {
	return fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
		method: isLiked ? 'PUT' : 'DELETE',
		headers: config.headers,
	}).then(getResponseData)
}
