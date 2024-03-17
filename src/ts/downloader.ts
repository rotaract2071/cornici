export default function download(url: URL, filename: string) {
	setTimeout(() => {
		const a = document.createElement("a");
		a.href = url.href;
		a.download = filename;
		a.click();
		a.remove();
	}, 50);
}
