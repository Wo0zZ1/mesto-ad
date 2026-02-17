/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import {
	createCardElement,
	decrementCardLikesCount,
	incrementCardLikesCount,
	removeCard,
	toggleCardLike,
} from './components/card.js'
import {
	openModalWindow,
	closeModalWindow,
	setCloseModalWindowEventListeners,
} from './components/modal.js'
import { enableValidation, clearValidation } from './components/validation.js'
import {
	getUserInfo,
	getCardList,
	setUserInfo,
	createNewCard,
	deleteCard,
	likeCard,
	setUserAvatar,
} from './components/api.js'
import { getFormSubmitButton, setButtonLoading } from './components/buttons.js'

// DOM узлы
const placesWrap = document.querySelector('.places__list')
const profileFormModalWindow = document.querySelector('.popup_type_edit')
const profileForm = profileFormModalWindow.querySelector('.popup__form')
export const profileTitleInput = profileForm.querySelector('.popup__input_type_name')
export const profileDescriptionInput = profileForm.querySelector(
	'.popup__input_type_description',
)

// Info modal
const cardInfoModalWindow = document.querySelector('.popup_type_info')
const cardInfoModalInfoList = cardInfoModalWindow.querySelector('.popup__info')
const cardInfoModalUserList = cardInfoModalWindow.querySelector('.popup__list')
const cardInfoDefinitionTemplate = document.querySelector(
	'#popup-info-definition-template',
)
const cardInfoUserTemplate = document.querySelector('#popup-info-user-preview-template')

const cardFormModalWindow = document.querySelector('.popup_type_new-card')
const cardForm = cardFormModalWindow.querySelector('.popup__form')
const cardNameInput = cardForm.querySelector('.popup__input_type_card-name')
const cardLinkInput = cardForm.querySelector('.popup__input_type_url')

export const imageModalWindow = document.querySelector('.popup_type_image')
export const imageElement = imageModalWindow.querySelector('.popup__image')
export const imageCaption = imageModalWindow.querySelector('.popup__caption')

const openProfileFormButton = document.querySelector('.profile__edit-button')
const openCardFormButton = document.querySelector('.profile__add-button')

const profileTitle = document.querySelector('.profile__title')
const profileDescription = document.querySelector('.profile__description')
const profileAvatar = document.querySelector('.profile__image')

const avatarFormModalWindow = document.querySelector('.popup_type_edit-avatar')
const avatarForm = avatarFormModalWindow.querySelector('.popup__form')
const avatarInput = avatarForm.querySelector('.popup__input')

// Создание объекта с настройками валидации
const validationSettings = {
	formSelector: '.popup__form',
	inputSelector: '.popup__input',
	submitButtonSelector: '.popup__button',
	inactiveButtonClass: 'popup__button_disabled',
	inputErrorClass: 'popup__input_type_error',
	errorClass: 'popup__error_visible',
}

// включение валидации вызовом enableValidation
// все настройки передаются при вызове
enableValidation(validationSettings)

const handlePreviewPicture = ({ name, link }) => {
	imageElement.src = link
	imageElement.alt = name
	imageCaption.textContent = name
	openModalWindow(imageModalWindow)
}

/**
 * @param {SubmitEvent} evt
 */
const handleProfileFormSubmit = async evt => {
	evt.preventDefault()

	const form = evt.target
	const submitButtonElement = getFormSubmitButton(form)

	const loadingOptions = {
		loadingText: 'Сохранение...',
		loadingClass: 'popup__button_loading',
	}

	setButtonLoading(submitButtonElement, true, loadingOptions)

	const userInfoData = {
		name: profileTitleInput.value,
		about: profileDescriptionInput.value,
	}

	const setUserInfoData = await setUserInfo(userInfoData)

	setButtonLoading(submitButtonElement, false, loadingOptions)

	profileTitle.textContent = profileTitleInput.value
	profileDescription.textContent = profileDescriptionInput.value

	closeModalWindow(profileFormModalWindow)
}

/**
 * @param {SubmitEvent} evt
 */
const handleAvatarFromSubmit = async evt => {
	evt.preventDefault()

	const form = evt.target
	const submitButtonElement = getFormSubmitButton(form)

	const loadingOptions = {
		loadingText: 'Сохранение...',
		loadingClass: 'popup__button_loading',
	}

	setButtonLoading(submitButtonElement, true, loadingOptions)

	const avatarData = {
		avatar: avatarInput.value,
	}

	const setUserAvatarData = await setUserAvatar(avatarData)

	setButtonLoading(submitButtonElement, false, loadingOptions)

	profileAvatar.style.backgroundImage = `url(${setUserAvatarData.avatar})`

	closeModalWindow(avatarFormModalWindow)
}

/**
 * @param {SubmitEvent} evt
 */
const handleCardFormSubmit = async evt => {
	evt.preventDefault()

	const form = evt.target
	const submitButtonElement = getFormSubmitButton(form)

	const loadingOptions = {
		loadingText: 'Создание...',
		loadingClass: 'popup__button_loading',
	}

	setButtonLoading(submitButtonElement, true, loadingOptions)

	const cardData = {
		name: cardNameInput.value,
		link: cardLinkInput.value,
	}

	const createNewCardData = await createNewCard(cardData)

	setButtonLoading(submitButtonElement, false, loadingOptions)

	placesWrap.prepend(
		createCardElement(createNewCardData, {
			onPreviewPicture: handlePreviewPicture,
			onDeleteCard: cardElement => {
				deleteCard(cardElement.id)
				removeCard(cardElement)
			},
			onLikeIcon: ({ likeButton, cardLikesElement }) => {
				const isLiked = toggleCardLike(likeButton)
				likeCard(createNewCardData._id, isLiked)
				if (isLiked) incrementCardLikesCount(cardLikesElement)
				else decrementCardLikesCount(cardLikesElement)
			},
			ownerId: createNewCardData.owner._id,
		}),
	)

	closeModalWindow(cardFormModalWindow)
}

/**
 * Преобразовать дату в форматированную строку
 * @param {Date} date
 */
const formatDate = date => {
	return date.toLocaleDateString('ru-RU', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

// Info modal

/**
 * Генерирует разметку для <dl>
 * @param {string} key Ключ
 * @param {string} value Значение
 */
const createInfoString = (key, value) => {
	const infoStringElement = cardInfoDefinitionTemplate.content
		.querySelector('.popup__info-item')
		.cloneNode(true)

	const infoTermElement = infoStringElement.querySelector('.popup__info-term')
	const infoDefinitionElement = infoStringElement.querySelector(
		'.popup__info-description',
	)

	infoTermElement.textContent = key
	infoDefinitionElement.textContent = value

	infoStringElement.append(infoTermElement, infoDefinitionElement)
	return infoStringElement
}

/**
 * Генерирует разметку для пользователя в списке лайкнувших
 * @param {string} userName Имя пользователя
 * @returns {Element} Элемент с именем пользователя
 */
const createUserBadge = userName => {
	const userElement = cardInfoUserTemplate.content
		.querySelector('.popup__list-item')
		.cloneNode(true)

	userElement.textContent = userName
	return userElement
}

/**
 * Обработчик клика по кнопке "Информация о карточке"
 * @param {string} cardId ID карточки
 */
const handleInfoClick = cardId => {
	// Сброс состояния
	cardInfoModalInfoList.innerHTML = ''
	cardInfoModalUserList.innerHTML = ''

	getCardList()
		.then(cards => {
			const card = cards.find(card => card._id === cardId)
			if (!card) throw new Error('Card not found')

			cardInfoModalInfoList.append(createInfoString('Описание:', card.name))
			cardInfoModalInfoList.append(
				createInfoString('Дата создания:', formatDate(new Date(card.createdAt))),
			)
			cardInfoModalInfoList.append(createInfoString('Владелец:', card.owner.name))
			cardInfoModalInfoList.append(
				createInfoString('Количество лайков:', card.likes.length),
			)

			card.likes.forEach(like => {
				cardInfoModalUserList.append(createUserBadge(like.name))
			})

			openModalWindow(cardInfoModalWindow)
		})
		.catch(err => {
			console.error(err)
		})
}

// EventListeners
profileForm.addEventListener('submit', handleProfileFormSubmit)
cardForm.addEventListener('submit', handleCardFormSubmit)
avatarForm.addEventListener('submit', handleAvatarFromSubmit)

openProfileFormButton.addEventListener('click', () => {
	profileTitleInput.value = profileTitle.textContent
	profileDescriptionInput.value = profileDescription.textContent
	clearValidation(profileForm, validationSettings)
	openModalWindow(profileFormModalWindow)
})

profileAvatar.addEventListener('click', () => {
	avatarForm.reset()
	clearValidation(avatarForm, validationSettings)
	openModalWindow(avatarFormModalWindow)
})

openCardFormButton.addEventListener('click', () => {
	cardForm.reset()
	clearValidation(cardForm, validationSettings)
	openModalWindow(cardFormModalWindow)
})

// Настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll('.popup')

allPopups.forEach(popup => {
	setCloseModalWindowEventListeners(popup)
})

Promise.all([getCardList(), getUserInfo()])
	.then(([cards, userData]) => {
		cards.forEach(cardData => {
			placesWrap.append(
				createCardElement(cardData, {
					onPreviewPicture: handlePreviewPicture,
					onDeleteCard: cardElement => {
						deleteCard(cardElement.id)
						removeCard(cardElement)
					},
					onLikeIcon: ({ likeButton, cardLikesElement }) => {
						const isLiked = toggleCardLike(likeButton)
						likeCard(cardData._id, isLiked)
						if (isLiked) incrementCardLikesCount(cardLikesElement)
						else decrementCardLikesCount(cardLikesElement)
					},
					onGetInfo: handleInfoClick,
					ownerId: userData._id,
				}),
			)
		})
		profileTitle.textContent = userData.name
		profileDescription.textContent = userData.about
		profileAvatar.style.backgroundImage = `url(${userData.avatar})`
	})
	.catch(err => {
		console.error(err)
	})
