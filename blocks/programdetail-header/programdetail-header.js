import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
    const childBlock = block.querySelectorAll("div");
    console.log("block", block);
    console.log("child", [...block.children]);

    [...block.children].forEach((row, i) => { 
       console.log("aa", row) ;
       row.classList.add(`row-${i}`);
    });
}