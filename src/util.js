export const isCreatorMode = () => o3h.Instance.playType === o3h.PlayType.Creator;

export const isAudienceMode = () => o3h.Instance.playType === o3h.PlayType.Audience;

export const sleep = function(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export const loadImage = function(imageUri) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = function () { resolve(this); };
        image.onerror = function () { reject(); };
        image.src = imageUri;
    });
}
