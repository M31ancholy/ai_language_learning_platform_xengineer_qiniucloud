/**
 * 语塔攀登 - 评分显示组件
 */
import { CONSTANTS } from '../utils/Constants.js';

export class ScoreDisplay {
    constructor(scene, x, y) {
        this.scene = scene;
        this.container = scene.add.container(x, y);
    }

    showGrade(grade, score) {
        const gradeData = CONSTANTS.GRADES[grade] || CONSTANTS.GRADES.F;
        const color = '#' + gradeData.color.toString(16).padStart(6, '0');

        const gradeText = this.scene.add.text(0, 0, grade, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '48px',
            color: color,
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5);

        const scoreText = this.scene.add.text(0, 40, `${score}分`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#ffffff',
        }).setOrigin(0.5);

        this.container.add([gradeText, scoreText]);

        // 弹入动画
        this.container.setScale(0);
        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut',
        });
    }

    destroy() { this.container.destroy(true); }
}
