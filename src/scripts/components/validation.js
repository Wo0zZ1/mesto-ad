/**
 * Отображает сообщение об ошибке под невалидным полем и добавляет соответствующие классы.
 * @param {HTMLFormElement} formElement
 * @param {HTMLInputElement} inputElement
 * @param {String} errorMessage
 */
const showInputError = (formElement, inputElement, errorMessage, settings) => {
	const errorElement = formElement.querySelector(`#${inputElement.id}-error`)

	inputElement.classList.add(settings.inputErrorClass)

	errorElement.textContent = errorMessage
	errorElement.classList.add(settings.errorClass)
}

/**
 * Скрывает сообщение об ошибке и удаляет классы, связанные с ошибкой
 * @param {HTMLFormElement} formElement
 * @param {HTMLInputElement} inputElement
 */
const hideInputError = (formElement, inputElement, settings) => {
	const errorElement = formElement.querySelector(`#${inputElement.id}-error`)

	inputElement.classList.remove(settings.inputErrorClass)

	errorElement.textContent = ''
	errorElement.classList.remove(settings.errorClass)
}

/**
 * Проверяет валидность конкретного поля.
 * @param {HTMLFormElement} formElement
 * @param {HTMLInputElement} inputElement
 */
const checkInputValidity = (formElement, inputElement, settings) => {
	if (inputElement.validity.valid)
		return hideInputError(formElement, inputElement, settings)

	let validationMessage = ''
	if (inputElement.validity.patternMismatch) {
		const customMessage = inputElement.getAttribute('data-error-message')
		validationMessage = customMessage || inputElement.validationMessage
	} else {
		validationMessage = inputElement.validationMessage
	}

	showInputError(formElement, inputElement, validationMessage, settings)
}

/**
 * Возвращает значение true, если хотя бы одно поле формы не прошло валидацию
 * @param {HTMLInputElement[]} inputElements
 */
const hasInvalidInput = inputElements => {
	return inputElements.some(inputElement => !inputElement.validity.valid)
}

/**
 * Делает кнопку формы неактивной
 * @param {HTMLButtonElement} buttonElement
 */
const disableSubmitButton = (buttonElement, inactiveButtonClass) => {
	buttonElement.classList.add(inactiveButtonClass)
	buttonElement.disabled = true
}

/**
 * Включает кнопку формы
 * @param {HTMLButtonElement} buttonElement
 */
const enableSubmitButton = (buttonElement, inactiveButtonClass) => {
	buttonElement.classList.remove(inactiveButtonClass)
	buttonElement.disabled = false
}

/**
 * Включает или отключает кнопку формы в зависимости от валидности всех полей.
 * Если хотя бы одно из полей не прошло валидацию, кнопка формы должна быть неактивной.
 * Если оба поля прошли — активной
 * @param {HTMLInputElement} inputElement
 * @param {HTMLButtonElement} buttonElement
 */
const toggleButtonState = (inputElements, buttonElement, settings) => {
	const someInvalidInput = hasInvalidInput(inputElements)

	if (someInvalidInput) disableSubmitButton(buttonElement, settings.inactiveButtonClass)
	else enableSubmitButton(buttonElement, settings.inactiveButtonClass)
}

/**
 * Добавляет обработчики события input для всех полей формы.
 * При каждом вводе проверяет валидность поля и вызывает функцию toggleButtonState
 * @param {HTMLFormElement} formElement
 */
const setEventListeners = (formElement, settings) => {
	const inputElements = Array.from(formElement.querySelectorAll(settings.inputSelector))
	const buttonElement = formElement.querySelector(settings.submitButtonSelector)
	toggleButtonState(inputElements, buttonElement, settings)

	inputElements.forEach(inputElement => {
		inputElement.addEventListener('input', e => {
			checkInputValidity(formElement, inputElement, settings)
			toggleButtonState(inputElements, buttonElement, settings)
		})
	})
}

/**
 * Очищает ошибки валидации формы и делает кнопку неактивной
 * Принимает DOM-элемент формы и объект с настройками.
 * Используйте эту функцию при открытии формы редактирования профиля
 * @param {HTMLFormElement} formElement
 */
export const clearValidation = (formElement, settings) => {
	const inputElements = Array.from(formElement.querySelectorAll(settings.inputSelector))
	inputElements.forEach(inputElement => {
		hideInputError(formElement, inputElement, settings)
	})

	const buttonElement = formElement.querySelector(settings.submitButtonSelector)
	disableSubmitButton(buttonElement, settings.inactiveButtonClass)
}

/**
 * Отвечает за включение валидации всех форм.
 * Функция должна принимать все нужные функциям селекторы элементов как объект настроек
 */
export const enableValidation = settings => {
	const formElements = document.querySelectorAll(settings.formSelector)
	formElements.forEach(formElement => {
		setEventListeners(formElement, settings)
	})
}
