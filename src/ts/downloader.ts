export function download(url: URL, file: File) {
	const a = document.createElement("a");
	a.href = url.href;
	a.download = file.name.split(".").slice(0, -1).join(".") + "_cornice.jpg";
	a.click();
}
