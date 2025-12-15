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
