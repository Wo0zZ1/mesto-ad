/**
 * @param {HTMLElement} cardLikesElement
 */
export const incrementCardLikesCount = cardLikesElement => {
	cardLikesElement.textContent = parseInt(cardLikesElement.textContent) + 1
}

/**
 * @param {HTMLElement} cardLikesElement
 */
export const decrementCardLikesCount = cardLikesElement => {
	cardLikesElement.textContent = parseInt(cardLikesElement.textContent) - 1
}

export const toggleCardLike = (likeButton, force) => {
	return likeButton.classList.toggle('card__like-button_is-active', force)
}

export const removeCard = cardElement => {
	cardElement.remove()
}

/**
 * @returns {HTMLElement}
 */
const getTemplate = () => {
	return document
		.getElementById('card-template')
		.content.querySelector('.card')
		.cloneNode(true)
}

export const createCardElement = (
	data,
	{ onPreviewPicture, onLikeIcon, onDeleteCard, ownerId },
) => {
	const cardElement = getTemplate()
	const likeButton = cardElement.querySelector('.card__like-button')
	const deleteButton = cardElement.querySelector('.card__control-button_type_delete')
	const cardImage = cardElement.querySelector('.card__image')
	const cardLikesElement = cardElement.querySelector('.card__like-count')

	cardElement.id = data._id
	cardImage.src = data.link
	cardImage.alt = data.name
	cardElement.querySelector('.card__title').textContent = data.name
	cardLikesElement.textContent = data.likes.length

	if (onLikeIcon) {
		likeButton.addEventListener('click', () =>
			onLikeIcon({ likeButton, cardLikesElement }),
		)
	}

	if (onDeleteCard) {
		deleteButton.addEventListener('click', () => onDeleteCard(cardElement))
	}

	if (onPreviewPicture) {
		cardImage.addEventListener('click', () =>
			onPreviewPicture({ name: data.name, link: data.link }),
		)
	}

	const isLiked = data.likes.some(like => like._id === ownerId)
	if (isLiked) {
		toggleCardLike(likeButton, true)
	}

	if (data.owner._id !== ownerId) deleteButton.remove()

	return cardElement
}
