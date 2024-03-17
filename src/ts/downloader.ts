export default function downloadAndRevoke(url: URL, filename: string) {
	setTimeout(() => {
		const a = document.createElement("a");
		a.href = url.href;
		a.download = filename;
		a.click();
		a.remove();
		URL.revokeObjectURL(url.href);
	}, 50);
}
