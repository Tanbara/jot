// The draggable popup logic

const container = document.body; // 👈 use body as container
const draggable = document.getElementById('draggable');
let isDragging = false;
let startX = 0, startY = 0, baseLeft = 0, baseTop = 0;

draggable.addEventListener('mousedown', (e) => {
    isDragging = true;
    draggable.style.userSelect = 'none';

    const rect = draggable.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    baseLeft = rect.left - containerRect.left;
    baseTop = rect.top - containerRect.top;
    startX = e.clientX;
    startY = e.clientY;

    const onMouseMove = (e2) => {
        if (!isDragging) return;

        const x = baseLeft + (e2.clientX - startX);
        const y = baseTop + (e2.clientY - startY);

        // confine to body dimensions
        const maxX = container.clientWidth - draggable.clientWidth;
        const maxY = container.clientHeight - draggable.clientHeight;

        draggable.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        draggable.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    };

    const onMouseUp = () => {
        isDragging = false;
        draggable.style.userSelect = '';

        // Snap to nearest corner
        const c = container.getBoundingClientRect();
        const d = draggable.getBoundingClientRect();

        const distances = {
            'top-left': Math.hypot(d.left - c.left, d.top - c.top),
            'top-right': Math.hypot(d.right - c.right, d.top - c.top),
            'bottom-left': Math.hypot(d.left - c.left, d.bottom - c.bottom),
            'bottom-right': Math.hypot(d.right - c.right, d.bottom - c.bottom),
        };

        const closestCorner = Object.entries(distances).sort((a, b) => a[1] - b[1])[0][0];

        switch (closestCorner) {
            case 'top-left':
                draggable.style.left = `0px`;
                draggable.style.top = `0px`;
                break;
            case 'top-right':
                draggable.style.left = `${container.clientWidth - draggable.clientWidth}px`;
                draggable.style.top = `0px`;
                break;
            case 'bottom-left':
                draggable.style.left = `0px`;
                draggable.style.top = `${container.clientHeight - draggable.clientHeight}px`;
                break;
            case 'bottom-right':
                draggable.style.left = `${container.clientWidth - draggable.clientWidth}px`;
                draggable.style.top = `${container.clientHeight - draggable.clientHeight}px`;
                break;
        }

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});