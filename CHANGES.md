Changes made in the Refactorization

1. Noticed that in the original vibe code the AI generated the [app.js](http://app.js) as [server.js](http://server.js) so had to change that quickly  
2. Create the package.json to map the npm start script to the file  
3. AI generated CSS inline for my html files and in the [main.js](http://main.js) file so had to remove those and instead place all the inline styles inside of the style.css file  
   1. In index.html it was lines 29, 52, 53, 54, 58, 59, and 60  
   2. In nutrition.html it was lines 27, 29-31, 34-36, 38, 39, 43-46, 48, 49, 51, 52, 56-59, 61, 62, 64, 65, 70, 78, 79, 83, 88, and 118  
   3. In index.html it was lines 24, 28, 32, 35, 38, 40, 41, 45, 49, 58, 65, 83, 94, 95, 99, 114, 115, 119, 123, and 132  
   4. In main.js it was lines 342-344, 350, 352, 353, 464, 580, 590, 666, 668, 669, 671, 674, 703-706, 770, 774,   
4. After removing these inline had to also replace them with class names so can change them inside the style.css  
5. Added the styles that were deleted from the inline of the html files and [main.js](http://main.js) file into the style.css file by defining the style with the class given to them after removing the original inline info   
6. AI originally didn't correctly fulfill the display override requirement so set \<span\> elements to act like block-level containers in the style.css file. Can be seen in the [main.js](http://main.js) where used \<strong\> tag to wrap around text to apply the class  
7. AI originally tried to target dynamically generated js list to complete the ::before pseudo-element list req but changed this because in the original code required button clicks to genersate the workout log dynnamically so changed the rqiremnt to a static html element to ensure that the  

Why the changes were needed 

1. For the first bullet point the submission directly stated that the file should be named [app.js](http://app.js) so this was a necessary changes  
2. For bullet point two the orignal vibe coded application generated an entry point as [server.js](http://server.js) without a package manager, so package.json was made to map the npm script and meet the server routing/startup reqs  
3. For bullet point three, the AI generated inline styles in all the html files and [main.js](http://main.js) file which does not fit the professional structural standards which meant these were necessary changes  
   1. Main jss file seen in lines 330, 339, 651 and 686  
4.  