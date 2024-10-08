const clickanalytics = () =>{
  const anchorTags = document.querySelectorAll("a");
  console.log("s", anchorTags);

  anchorTags.forEach((anchor) =>{   
    const linkName = anchor.innerText;
    const linkRegion = anchor.closest('.block').getAttribute('data-block-name');
   
    anchor.addEventListener('click', () => {
      console.log('name', linkName);
      console.log('region', linkRegion);
  
    });
  })
};

export default clickanalytics;