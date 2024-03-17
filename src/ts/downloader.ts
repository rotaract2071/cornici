export default function download(url: URL, originalFilename: string) {
	const a = document.createElement("a");
	a.href = url.href;
	a.download = originalFilename.split(".").slice(0, -1).join(".") + "_con_cornice.png";
	a.click();
	a.remove();
}
