import shutil
import os

src1 = r"C:\Users\acer\.gemini\antigravity-ide\brain\91c19c37-2e95-4c74-9e56-71bc433481b4\xinvoice_cover_1780716315866.png"
dst1 = r"c:\Users\acer\Desktop\BA OF ME\Portfolio\assets\images\projects\xinvoice.png"

src2 = r"C:\Users\acer\.gemini\antigravity-ide\brain\91c19c37-2e95-4c74-9e56-71bc433481b4\payos_cover_1780716327364.png"
dst2 = r"c:\Users\acer\Desktop\BA OF ME\Portfolio\assets\images\projects\payos.png"

os.makedirs(os.path.dirname(dst1), exist_ok=True)

shutil.copy(src1, dst1)
shutil.copy(src2, dst2)
print("Done")
