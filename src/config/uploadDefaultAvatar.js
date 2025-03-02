import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// You can use this function once to upload a default avatar
export const uploadDefaultAvatar = async () => {
  const storage = getStorage();
  const defaultAvatarRef = ref(storage, 'defaults/default-avatar.png');
  
  // Create a simple colored square as default avatar
  const size = 200;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Draw a gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1');
  gradient.addColorStop(1, '#4f46e5');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Convert to blob
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  
  // Upload to Firebase Storage
  await uploadBytes(defaultAvatarRef, blob);
  return getDownloadURL(defaultAvatarRef);
}; 