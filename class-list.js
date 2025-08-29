/* Return a list containing all classes of the CS Department 
 * ✓ - Indicates that I have successfully completed the course
 * ~ - Currently taking the course
 * X - I have not yet taken the class, but am more than happy to help
*/

/* Hardcoded class list for Fall '25 semester */
export const classList = [
    "-- choose the course --",  // Initial entry
    "COSC116 - Intro to Computer Systems ✓",
    "COSC117 - Programming Fundementals ✓",
    "COSC118 - Intro to Scientific Programming ✓",
    "COSC120 - Computer Science 1 ✓",
    "COSC220 - Computer Science 2 / Intro to Data Structures and Algorithms ✓",
    "COSC250 - Microcomputer Organization ✓",
    "COSC290 - Special Topics: Generative AI for Everyone X",
    "COSC311 - Intro to Data Visualization and Interpretation ✓",
    "COSC320 - Advanced Data Structures & Algorithms ✓",
    "COSC350 - Systems Software ✓",
    "COSC362 - Theory of Computation ✓",
    "COSC386 - Database Design and Implementation ✓",
    "COSC411 - Artificial Intelligence ✓",
    "COSC420 - High-Performance Computing ~",
    "COSC425/426 - Software Engineering ✓",
    "COSC450 - Operating Systems ✓",
    "COSC490 - Special Topics: Convolutional Neural Nets X",
    "DSCI218 - Intro to Data Science X",
    "DSCI470 - Research Methods in Data Science ~",
    "DSCI490 - Capstone Project X",
    "Other/misc question"
];

/** Helper function - getter */
export function getClassList(){
    return classList;
}