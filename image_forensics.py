import io
import base64
import math
from PIL import Image, ImageChops, ImageEnhance, ImageOps, ImageStat

def perform_forensic_ela(image_bytes, quality=90):
    """
    Performs Error Level Analysis (ELA) and thermal manipulation heatmap on an image.
    Detects re-compressed, spliced, cloned, or Photoshop/Canva edited regions.
    """
    try:
        orig = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        width, height = orig.size
        
        # Limit max dimension for fast processing while retaining high forensic fidelity
        max_dim = 1000
        if max(width, height) > max_dim:
            scale_ratio = max_dim / max(width, height)
            orig = orig.resize((int(width * scale_ratio), int(height * scale_ratio)), Image.Resampling.LANCZOS)
        
        # 1. Original Image Base64
        orig_buf = io.BytesIO()
        orig.save(orig_buf, 'JPEG', quality=92)
        orig_b64 = 'data:image/jpeg;base64,' + base64.b64encode(orig_buf.getvalue()).decode('utf-8')
        
        # 2. Perform ELA: Re-save at quality=90
        temp_buf = io.BytesIO()
        orig.save(temp_buf, 'JPEG', quality=quality)
        temp_buf.seek(0)
        recompressed = Image.open(temp_buf)
        
        # Difference between original and recompressed
        diff = ImageChops.difference(orig, recompressed)
        
        # Statistical analysis on difference for tampering score
        stat = ImageStat.Stat(diff)
        mean_diff = sum(stat.mean) / len(stat.mean)
        stddev_diff = sum(stat.stddev) / len(stat.stddev)
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        if max_diff == 0:
            max_diff = 1
            
        # Scale difference so variations are visibly highlighted
        scale = min(255.0 / max_diff, 20.0)
        ela_img = ImageEnhance.Brightness(diff).enhance(scale)
        
        ela_buf = io.BytesIO()
        ela_img.save(ela_buf, 'JPEG', quality=95)
        ela_b64 = 'data:image/jpeg;base64,' + base64.b64encode(ela_buf.getvalue()).decode('utf-8')
        
        # 3. Generate Forensic Thermal Heatmap
        gray_diff = ImageOps.grayscale(diff)
        gray_enhanced = ImageEnhance.Brightness(gray_diff).enhance(scale)
        
        # Custom Thermal Forensics Color Palette (Deep Navy -> Cyan -> Green -> Yellow -> Bright Red)
        palette = []
        for i in range(256):
            if i < 64:
                r = int(i * 0.5)
                g = int(i * 3.5)
                b = int(120 + i * 2)
            elif i < 128:
                r = 0
                g = 240
                b = int(255 - (i - 64) * 3.8)
            elif i < 192:
                r = int((i - 128) * 4)
                g = 250
                b = 0
            else:
                r = 255
                g = int(250 - (i - 192) * 3.8)
                b = int((i - 192) * 1.5)
            palette.extend([min(255, max(0, r)), min(255, max(0, g)), min(255, max(0, b))])
            
        pal_img = gray_enhanced.convert('P')
        pal_img.putpalette(palette)
        thermal_img = pal_img.convert('RGB')
        
        thermal_buf = io.BytesIO()
        thermal_img.save(thermal_buf, 'PNG')
        thermal_b64 = 'data:image/png;base64,' + base64.b64encode(thermal_buf.getvalue()).decode('utf-8')
        
        # 4. Compute Tampering Risk Score (0-100)
        # Higher stddev and max_diff indicate uneven compression / edited text or objects
        raw_tamper_score = int(min(98, max(12, (stddev_diff * 4.2) + (max_diff * 0.65))))
        if raw_tamper_score > 70:
            level = "High Tampering Risk (Likely Edited / Manipulated)"
            summary = "Significant Error Level differences detected. Highlighted bright regions (yellow/red) indicate modified text, pasted elements, or altered digital assets."
        elif raw_tamper_score > 40:
            level = "Moderate Compression Anomaly"
            summary = "Minor compression inconsistencies detected across image layers. Could be due to multi-platform re-saving (e.g. WhatsApp / Twitter) or subtle edits."
        else:
            level = "Low / Natural Uniform Compression"
            summary = "Uniform error level pattern detected across the entire image. No obvious spliced or high-contrast pasted elements detected."
            
        return {
            'has_forensics': True,
            'original_image': orig_b64,
            'ela_image': ela_b64,
            'heatmap_image': thermal_b64,
            'tampering_score': raw_tamper_score,
            'tampering_level': level,
            'summary': summary
        }
    except Exception as e:
        print(f"Forensic ELA Error: {e}")
        return {
            'has_forensics': False,
            'error': str(e)
        }