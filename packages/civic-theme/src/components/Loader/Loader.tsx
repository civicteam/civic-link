import { motion } from "framer-motion";
import React from "react";

const offset = 10;
const loaderVariants = {
  animationOne: {
    y: [-offset, offset, -offset],
    opacity: [0.4, 0.6],
    transition: {
      y: {
        type: "ease-in-out",
        repeat: Infinity,
        duration: 0.5,
      },
      opacity: {
        type: "ease-in-out",
        repeat: Infinity,
        duration: 1,
      },
    },
  },
  animationTwo: {
    y: [offset, -offset, offset],
    opacity: [0.4, 0.6],
    transition: {
      y: {
        delay: 0.1,
        type: "ease-in-out",
        repeat: Infinity,
        duration: 0.5,
      },
      opacity: {
        type: "ease-in-out",
        repeat: Infinity,
        duration: 1,
      },
    },
  },
  animationThree: {
    y: [-offset, offset, -offset],
    opacity: [0.4, 0.6],
    transition: {
      y: {
        delay: 0.2,
        type: "ease-in-out",
        repeat: Infinity,
        duration: 0.5,
      },
      opacity: {
        type: "ease-in-out",
        repeat: Infinity,
        duration: 1,
      },
    },
  },
  animationFour: {
    y: [offset, -offset, offset],
    opacity: [0.4, 0.6],
    transition: {
      y: {
        delay: 0.3,
        type: "ease-in-out",
        repeat: Infinity,
        duration: 0.5,
      },
      opacity: {
        type: "ease-in-out",
        repeat: Infinity,
        duration: 1,
      },
    },
  },
};

function Loader(): React.ReactElement {
  return (
    <div className="mt-8 flex space-x-4">
      <motion.div
        className="h-4 w-4 rounded-full bg-primary shadow-inner"
        variants={loaderVariants}
        animate="animationOne"
      />
      <motion.div
        className="h-4 w-4 rounded-full bg-primary shadow-inner"
        variants={loaderVariants}
        animate="animationTwo"
      />
      <motion.div
        className="h-4 w-4 rounded-full bg-primary shadow-inner"
        variants={loaderVariants}
        animate="animationThree"
      />
      <motion.div
        className="h-4 w-4 rounded-full bg-primary shadow-inner"
        variants={loaderVariants}
        animate="animationFour"
      />
    </div>
  );
}

export default Loader;
