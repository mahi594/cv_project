import cv2
import numpy as np
import base64

def encode_image(img):
    _, buffer = cv2.imencode('.jpg', img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{img_base64}"

def compute_histogram(img):
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    return hist.flatten().tolist()

class CVPipeline:
    @staticmethod
    def _color_models(img, params):
        # Conversions
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
        
        return {
            "images": [
                {"title": "Original Image", "data": encode_image(img)},
                {"title": "HSV Color Space", "data": encode_image(hsv)},
                {"title": "LAB Color Space", "data": encode_image(lab)},
                {"title": "YCrCb Color Space", "data": encode_image(ycrcb)}
            ],
            "metrics": {}
        }
    
    @staticmethod
    def _fourier_analysis(img, params):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Compute DTF
        dft = cv2.dft(np.float32(gray), flags=cv2.DFT_COMPLEX_OUTPUT)
        dft_shift = np.fft.fftshift(dft)
        
        # Magnitude spectrum
        magnitude_spectrum = 20 * np.log(cv2.magnitude(dft_shift[:,:,0], dft_shift[:,:,1]) + 1)
        # Normalize to 0-255 for display
        magnitude_spectrum = cv2.normalize(magnitude_spectrum, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
        # Convert to BGR so encoding handles it consistently
        magnitude_bgr = cv2.cvtColor(magnitude_spectrum, cv2.COLOR_GRAY2BGR)

        # Filtering (High Pass - block center)
        rows, cols = gray.shape
        crow, ccol = rows//2, cols//2
        mask_radius = int(params.get('maskRadius', 30))
        
        # High Pass Filter
        mask = np.ones((rows, cols, 2), np.uint8)
        mask[crow-mask_radius:crow+mask_radius, ccol-mask_radius:ccol+mask_radius] = 0
        fshift = dft_shift * mask
        f_ishift = np.fft.ifftshift(fshift)
        img_back = cv2.idft(f_ishift)
        img_back = cv2.magnitude(img_back[:,:,0], img_back[:,:,1])
        img_back = cv2.normalize(img_back, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
        img_back_bgr = cv2.cvtColor(img_back, cv2.COLOR_GRAY2BGR)

        return {
            "images": [
                {"title": "Original Grayscale", "data": encode_image(gray)},
                {"title": "Magnitude Spectrum", "data": encode_image(magnitude_bgr)},
                {"title": f"High Pass Filter (R={mask_radius})", "data": encode_image(img_back_bgr)}
            ],
            "metrics": {}
        }

    @staticmethod
    def _noise_reduction(img, params):
        # Inject Noise
        noise_type = params.get('noiseType', 'gaussian')
        noise_var = float(params.get('noiseVariance', 0.05))
        
        noisy = np.copy(img)
        if noise_type == 'gaussian':
            noise = np.random.normal(0, noise_var * 255, noisy.shape).astype(np.float32)
            noisy = cv2.add(noisy.astype(np.float32), noise)
            noisy = np.clip(noisy, 0, 255).astype(np.uint8)
        else: # Salt and Pepper
            prob = noise_var
            rdm = np.random.rand(*noisy.shape[:2])
            noisy[rdm < prob / 2] = [0, 0, 0]
            noisy[rdm > 1 - (prob / 2)] = [255, 255, 255]

        # Reduce Noise
        filter_type = params.get('filterType', 'gaussian')
        ksize = int(params.get('kernelSize', 5))
        if ksize % 2 == 0: ksize += 1

        if filter_type == 'gaussian':
            restored = cv2.GaussianBlur(noisy, (ksize, ksize), 0)
        elif filter_type == 'median':
            restored = cv2.medianBlur(noisy, ksize)
        else: # Bilateral
            restored = cv2.bilateralFilter(noisy, d=9, sigmaColor=75, sigmaSpace=75)
            
        return {
            "images": [
                {"title": "Original Image", "data": encode_image(img)},
                {"title": f"Corrupted ({noise_type})", "data": encode_image(noisy)},
                {"title": f"Restored ({filter_type})", "data": encode_image(restored)}
            ],
            "metrics": {}
        }

    @staticmethod
    def _edge_detection(img, params):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Canny
        canny_min = int(params.get('cannyMin', 50))
        canny_max = int(params.get('cannyMax', 150))
        canny = cv2.Canny(gray, canny_min, canny_max)
        
        # Laplacian of Gaussian (LoG)
        ksize = int(params.get('kernelSize', 3))
        if ksize % 2 == 0: ksize += 1
        blur = cv2.GaussianBlur(gray, (ksize, ksize), 0)
        laplacian = cv2.Laplacian(blur, cv2.CV_64F)
        log = cv2.convertScaleAbs(laplacian)

        # Difference of Gaussians (DoG)
        k1, k2 = ksize, ksize + 4
        g1 = cv2.GaussianBlur(gray, (k1, k1), 0)
        g2 = cv2.GaussianBlur(gray, (k2, k2), 0)
        dog = cv2.convertScaleAbs(g1.astype(np.float32) - g2.astype(np.float32))

        return {
            "images": [
                {"title": "Original Grayscale", "data": encode_image(cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR))},
                {"title": "Canny Edge Detection", "data": encode_image(cv2.cvtColor(canny, cv2.COLOR_GRAY2BGR))},
                {"title": "Laplacian of Gaussian (LoG)", "data": encode_image(cv2.cvtColor(log, cv2.COLOR_GRAY2BGR))},
                {"title": "Difference of Gaussians (DoG)", "data": encode_image(cv2.cvtColor(dog, cv2.COLOR_GRAY2BGR))}
            ],
            "metrics": {}
        }
        
    @staticmethod
    def _corner_detection(img, params):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = np.float32(gray)
        
        # Harris Corner Detection
        block_size = int(params.get('blockSize', 2))
        ksize = int(params.get('kSize', 3))
        k = float(params.get('kParam', 0.04))
        threshold_ratio = float(params.get('thresholdRatio', 0.01))

        dst = cv2.cornerHarris(gray, block_size, ksize, k)
        
        # Normalize and convert to viewable format
        dst_norm = np.empty(dst.shape, dtype=np.float32)
        cv2.normalize(dst, dst_norm, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
        dst_norm_scaled = cv2.convertScaleAbs(dst_norm)

        # Draw circles on original image
        overlay = img.copy()
        threshold = threshold_ratio * dst.max()
        for i in range(dst.shape[0]):
            for j in range(dst.shape[1]):
                if int(dst[i,j]) > threshold:
                    cv2.circle(overlay, (j,i), 3, (0, 0, 255), -1)

        return {
            "images": [
                {"title": "Original Image", "data": encode_image(img)},
                {"title": "Harris Response Map", "data": encode_image(cv2.cvtColor(dst_norm_scaled, cv2.COLOR_GRAY2BGR))},
                {"title": "Detected Corners Overlay", "data": encode_image(overlay)}
            ],
            "metrics": {}
        }
        
    @staticmethod
    def _feature_descriptors(img, params):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        n_features = int(params.get('nFeatures', 500))
        
        # Use ORB since SIFT can have varying support depending on exact opencv-python version
        orb = cv2.ORB_create(nfeatures=n_features)
        kp, des = orb.detectAndCompute(gray, None)
        
        overlay = cv2.drawKeypoints(img, kp, None, color=(0,255,0), flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)

        return {
            "images": [
                {"title": "Original Image", "data": encode_image(img)},
                {"title": f"ORB Features Detected ({len(kp)})", "data": encode_image(overlay)}
            ],
            "metrics": {}
        }


def process_image(img_path_or_bytes, category, params):
    # Decode image
    nparr = np.frombuffer(img_path_or_bytes, np.uint8)
    original_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if original_img is None:
        raise ValueError("Could not decode image")
        
    max_dim = 800
    h, w = original_img.shape[:2]
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        original_img = cv2.resize(original_img, (int(w * scale), int(h * scale)))

    methods = {
        'color_models': CVPipeline._color_models,
        'fourier_analysis': CVPipeline._fourier_analysis,
        'noise_reduction': CVPipeline._noise_reduction,
        'edge_detection': CVPipeline._edge_detection,
        'corner_detection': CVPipeline._corner_detection,
        'feature_descriptors': CVPipeline._feature_descriptors
    }

    if category in methods:
        return methods[category](original_img, params)
    
    # Fallback default
    return {"images": [{"title": "Original", "data": encode_image(original_img)}], "metrics": {}}
