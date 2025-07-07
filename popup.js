class OGImageGenerator {
    constructor() {
        this.ogImageElement = document.getElementById("ogImage");
        this.currentImageData = null;

        this.initializeEventListeners();
        this.renderDefaultPreview();
    }

    // 이벤트 리스너 초기화
    initializeEventListeners() {
        // 입력 필드 변경 시 미리보기 업데이트를 위한 이벤트 리스너들입니다.
        document
            .getElementById("title")
            .addEventListener("input", () => this.updatePreview());
        document
            .getElementById("subtitle")
            .addEventListener("input", () => this.updatePreview());
        document
            .getElementById("author")
            .addEventListener("input", () => this.updatePreview());
        document
            .getElementById("theme")
            .addEventListener("change", () => this.updatePreview());

        // 버튼 이벤트
        document
            .getElementById("generateBtn")
            .addEventListener("click", () => this.generateImage());
        document
            .getElementById("downloadBtn")
            .addEventListener("click", () => this.downloadImage());
    }

    // 기본 미리보기 렌더링
    renderDefaultPreview() {
        this.updateOGImage({
            title: "블로그 제목을 입력하세요",
            subtitle: "부제목을 입력하세요",
            author: "작성자명",
            theme: "modern",
        });
    }

    // input 값이 변경될 때마다 실행되는 함수입니다.
    updatePreview() {
        const title =
            document.getElementById("title").value ||
            "블로그 제목을 입력하세요";
        const subtitle =
            document.getElementById("subtitle").value || "부제목을 입력하세요";
        const author = document.getElementById("author").value || "작성자명";
        const theme = document.getElementById("theme").value;

        this.updateOGImage({ title, subtitle, author, theme });
    }

    updateOGImage({ title, subtitle, author, theme }) {
        const ogImage = this.ogImageElement;
        const titleElement = ogImage.querySelector(".og-title");
        const subtitleElement = ogImage.querySelector(".og-subtitle");
        const authorElement = ogImage.querySelector(".og-author");

        // 기존 테마 클래스 제거
        ogImage.classList.remove("modern", "minimal", "gradient", "dark");

        // 새 테마 클래스 추가
        ogImage.classList.add(theme);

        // 텍스트 업데이트
        titleElement.textContent = title;
        subtitleElement.textContent = subtitle;
        authorElement.textContent = `by ${author}`;

        // 부제목과 작성자가 기본값이면 숨기기
        if (subtitle === "부제목을 입력하세요") {
            subtitleElement.style.display = "none";
        } else {
            subtitleElement.style.display = "block";
        }

        if (author === "작성자명") {
            authorElement.style.display = "none";
        } else {
            authorElement.style.display = "block";
        }

        // 다운로드 버튼 활성화
        document.getElementById("downloadBtn").disabled = false;
    }

    async generateImage() {
        const generateBtn = document.getElementById("generateBtn");
        const originalText = generateBtn.textContent;

        generateBtn.textContent = "생성 중...";
        generateBtn.disabled = true;

        // 캡처용 임시 요소 생성
        const tempContainer = document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-9999px";
        tempContainer.style.top = "-9999px";
        tempContainer.style.width = "1200px";
        tempContainer.style.height = "630px";
        tempContainer.style.overflow = "hidden";
        tempContainer.style.backgroundColor = "#f8f9fa";

        // OG 이미지 복제
        const clonedImage = this.ogImageElement.cloneNode(true);

        // 스타일을 명시적으로 설정
        Object.assign(clonedImage.style, {
            width: "1200px",
            height: "630px",
            maxWidth: "1200px",
            transform: "none",
            position: "relative",
            display: "block",
            margin: "0",
            padding: "0",
        });

        // 텍스트 크기 조정
        const title = clonedImage.querySelector(".og-title");
        const subtitle = clonedImage.querySelector(".og-subtitle");
        const author = clonedImage.querySelector(".og-author");

        if (title) {
            title.style.fontSize = "72px";
            title.style.lineHeight = "1.2";
            title.style.marginBottom = "16px";
        }
        if (subtitle) {
            subtitle.style.fontSize = "36px";
            subtitle.style.marginBottom = "16px";
        }
        if (author) {
            author.style.fontSize = "24px";
        }

        tempContainer.appendChild(clonedImage);
        document.body.appendChild(tempContainer);

        try {
            // html2canvas로 캡처
            const canvas = await html2canvas(clonedImage, {
                width: 1200,
                height: 630,
                scale: 1,
                backgroundColor: null,
                useCORS: true,
                allowTaint: true,
                logging: false,
            });

            this.currentImageData = canvas.toDataURL("image/png");

            generateBtn.textContent = "생성 완료!";
            generateBtn.style.background =
                "linear-gradient(135deg, #4caf50 0%, #45a049 100%)";

            setTimeout(() => {
                generateBtn.textContent = originalText;
                generateBtn.style.background =
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
                generateBtn.disabled = false;
            }, 2000);
        } catch (error) {
            console.error("이미지 생성 중 오류:", error);
            generateBtn.textContent = "오류 발생";
            generateBtn.style.background =
                "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)";

            setTimeout(() => {
                generateBtn.textContent = originalText;
                generateBtn.style.background =
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
                generateBtn.disabled = false;
            }, 2000);
        } finally {
            // 임시 요소 제거
            document.body.removeChild(tempContainer);
        }
    }

    downloadImage() {
        if (!this.currentImageData) {
            alert("먼저 이미지를 생성해주세요!");
            return;
        }

        // Chrome Extension API를 사용하여 다운로드
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `og-image-${timestamp}.png`;

        chrome.downloads.download(
            {
                url: this.currentImageData,
                filename: filename,
                saveAs: true,
            },
            (downloadId) => {
                if (chrome.runtime.lastError) {
                    console.error("다운로드 오류:", chrome.runtime.lastError);
                    alert("다운로드 중 오류가 발생했습니다.");
                }
            }
        );
    }
}

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", () => {
    new OGImageGenerator();
});
