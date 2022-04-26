
const addImageBtn = document.querySelector(".sidebar-item__button")
const addImageInput = document.querySelector("#input-image")

const handleAddImageClick = (event) => {
	addImageInput.click()
	addImageInput.addEventListener("change", handleAddImageSelect)
}

const handleAddImageSelect = (event) => {
	const image = event.target.files[0]
	const reader = new FileReader()
	reader.addEventListener("load", showSelectedImage)
	reader.readAsDataURL(image)
}

const showSelectedImage = (event) => {
	const imageURL = event.target.result
	addSidebarItem(imageURL)
	addLayer(imageURL)
}

const sidebarItems = document.querySelector(".sidebar-items")
const addCompassButtons = []

const addSidebarItem = (imageURL) => {
	const newSidebarItem = document.createElement("li")
	newSidebarItem.className = `sidebar-item sidebar-item_${sidebarItems.children.length - 1} selected`
	newSidebarItem.style.backgroundImage = `url(${imageURL})`
	newSidebarItem.innerHTML = `
	<button class="sidebar-item__button sidebar-item__button-delete" aria-label="Delete image" title="Delete image">
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M23 20.168l-8.185-8.187 8.185-8.174-2.832-2.807-8.182 8.179-8.176-8.179-2.81 2.81 8.186 8.196-8.186 8.184 2.81 2.81 8.203-8.192 8.18 8.192z"/></svg>
	</button>
	<div class="actions-dropdown">
		<h3 class="sr-only">Actions</h3>
		<ul class="actions-dropdown__items">
			<li class="actions-dropdown__item">
				<label class="actions-dropdown__item-label" for="opacity-slider">Opacity:</label>
				<input class="actions-dropdown__item-range" type="range" min="0" max="100" value="100" id="opacity-slider">
			</li>
			<li class="actions-dropdown__item">
				<button class="actions-dropdown__item-button">Add compass</button>
			</li>
		</ul>
	</div>
	`
	newSidebarItem.children[0].addEventListener("click", event => handleDeleteImageClick(event, newSidebarItem))
	newSidebarItem.querySelector(".actions-dropdown__item-range").addEventListener("input", event => handleImageOpacityChange(event, newSidebarItem))
	const addCompassButton = newSidebarItem.querySelector(".actions-dropdown__item-button")
	addCompassButton.addEventListener("click", event => handleAddCompassClick(event, newSidebarItem))
	addCompassButton.disabled = !isCompassEnabled
	addCompassButtons.push(addCompassButton)

	// Maintain Add-Image button as last item
	const sidebarItemButton = sidebarItems.children[sidebarItems.children.length - 1]
	sidebarItems.replaceChild(newSidebarItem, sidebarItemButton)
	sidebarItems.append(sidebarItemButton)
}

const contentLayers = document.querySelector(".content-layers")
const layersWithCompass = []

const handleAddCompassClick = (event, sidebarItem) => {
	const sidebarItemInd = getSidebarItemInd(sidebarItem)
	layersWithCompass.push(sidebarItemInd)
	rotateLayersWithCompass(northAngle)
}

const handleImageOpacityChange = (event, sidebarItem) => {
	const sidebarItemInd = getSidebarItemInd(sidebarItem)
	const opacityValue = parseInt(event.target.value)/100
	contentLayers.children[sidebarItemInd].style.opacity = opacityValue
}

const handleDeleteImageClick = (event, sidebarItem) => {
	const sidebarItemInd = getSidebarItemInd(sidebarItem)
	sidebarItems.removeChild(sidebarItem)
	contentLayers.removeChild(contentLayers.children[sidebarItemInd])
}

/**
 * Add new layer on top of previous layers
 * @param {string} imageURL 
 */
const addLayer = (imageURL) => {
	const layersCount = contentLayers.children.length - 1
	const newLayer = document.createElement("div")
	const newLayerInd = layersCount + 1
	newLayer.className = `content-layer content-layer_${newLayerInd}`
	newLayer.style.backgroundImage = `url(${imageURL})`
	newLayer.style.zIndex = newLayerInd
	contentLayers.append(newLayer)
}

const getSidebarItemInd = (sidebarItem) => {
	const sidebarItemInd = parseInt((sidebarItem.classList[1].split("_"))[1])
	return sidebarItemInd
}

var isCompassEnabled = false
var northAngle = 0
const compass = document.querySelector(".content-directions")
const compassText = document.querySelector(".content-directions__text")

/**
 * Watch for device movement
 * Update layers(with added compass) when direction to North changes/ device moves
 * Disable "Add Compass" buttons if not on mobile
 */
const handleDeviceOrientation = (orientation) => {
	orientation.listen(function() {
		const currentOrientation = orientation.getScreenAdjustedEuler();
		const compassHeading = (360 - currentOrientation.alpha + 90) % 360;
		compassText.textContent = compassHeading
		northAngle = 360 - compassHeading
		rotateLayersWithCompass(northAngle)
	})
}

/**
 * Enable/Disable "Add Compass" buttons
 * @param {boolean} isEnabled 
 */
const toggleAddCompassButton = (isEnabled) => {
	for(const button in addCompassButtons){
		button.disabled = !isEnabled
	}
}

/**
 * Rotate all layers(with added compass)
 * By {degFromNorth} degrees
 * @param {double} angle 
 */
const rotateLayersWithCompass = (angle) => {
	for(const layerInd of layersWithCompass){
		contentLayers.children[layerInd].style.transform = `rotate(${angle}deg)`
	}
	compass.style.transform = `rotate(${angle}deg)`
}

addImageBtn.addEventListener("click", handleAddImageClick)
if(window.DeviceOrientationEvent && 'ontouchstart' in window){
	isCompassEnabled = true
	FULLTILT.getDeviceOrientation({ 'type': 'world' })
	.then(handleDeviceOrientation)
	.catch(error => {
		isCompassEnabled = false
	})
}
else{
	isCompassEnabled = false
}

