const body=document.querySelector('.body');
    body.addEventListener('scroll',()=>{
        console.log(body.scrollTop)
        const background_image1=document.querySelector('.img1');
        const background_image2=document.querySelector('.img2');
        if(body.scrollTop>600){
            background_image1.style='opacity: 0';
            // console.log(body.scrollTop);
            if(body.scrollTop<1100){
              background_image2.style=`opacity: ${(body.scrollTop-1100)/600}`;
            }
            else if(body.scrollTop>1100){
              background_image2.style=`opacity: ${(body.scrollTop-1100)/600}`;
            }
        }else{
            background_image1.style=`opacity: ${1-body.scrollTop/600}`;
        }

    })