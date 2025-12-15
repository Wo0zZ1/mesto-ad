/**
 * Меняет текст кнопки
 * @param {HTMLButtonElement} button
 * @param {boolean} isLoading
 * @param {{loadingText: string, loadingClass: string}} options
 * @returns {void}
 */
export const setButtonLoading = (button, isLoading, options = {}) => {
	const { loadingText = 'Загрузка...', loadingClass = 'button_loading' } = options

	if (isLoading) {
		button._originalText = button.textContent
		button.disabled = true
		button.textContent = loadingText
		if (loadingClass) button.classList.add(loadingClass)
	} else {
		button.disabled = false
		button.textContent = button._originalText || button.textContent
		if (loadingClass) button.classList.remove(loadingClass)
	}
}

/**
 *
 * @param {HTMLFormElement} form
 * @returns {HTMLButtonElement}
 */
export const getFormSubmitButton = form => {
	return form.querySelector('button[type="submit"]')
}
