/**
 * 语塔攀登 - 场景转换效果
 */
import { CONSTANTS } from '../utils/Constants.js';

export class TransitionEffect {
    /**
     * 淡入效果
     */
    static fadeIn(scene, duration = 300) {
        const { width, height } = scene.scale;
        const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000).setDepth(9999);
        scene.tweens.add({
            targets: overlay,
            alpha: 0,
            duration,
            onComplete: () => overlay.destroy(),
        });
    }

    /**
     * 淡出效果（在场景切换前使用）
     */
    static fadeOut(scene, duration = 300, onComplete) {
        const { width, height } = scene.scale;
        const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0).setDepth(9999);
        scene.tweens.add({
            targets: overlay,
            alpha: 1,
            duration,
            onComplete: () => {
                if (onComplete) onComplete();
            },
        });
    }

    /**
     * 像素化转场
     */
    static pixelate(scene, duration = 500, onComplete) {
        const { width, height } = scene.scale;
        const blockSize = 8;
        const cols = Math.ceil(width / blockSize);
        const rows = Math.ceil(height / blockSize);
        const blocks = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const block = scene.add.rectangle(
                    c * blockSize + blockSize / 2,
                    r * blockSize + blockSize / 2,
                    blockSize, blockSize,
                    0x000000, 0
                ).setDepth(9999);
                blocks.push(block);
            }
        }

        // 随机顺序出现
        const shuffled = blocks.sort(() => Math.random() - 0.5);
        shuffled.forEach((block, i) => {
            scene.tweens.add({
                targets: block,
                alpha: 1,
                duration: 50,
                delay: (i / shuffled.length) * duration,
            });
        });

        scene.time.delayedCall(duration + 100, () => {
            blocks.forEach(b => b.destroy());
            if (onComplete) onComplete();
        });
    }
}
