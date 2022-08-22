/**
 *
 * MIT License
 *
 * Copyright 2021 Shogun, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import * as React from 'react'
import { useMultiStyleConfig, useTheme } from '@chakra-ui/react'
import { useSwipeable } from 'react-swipeable'
import Container from 'Components/Container'
import Icon from 'Components/Icon'
import IconButton from 'Components/IconButton'
import Image from 'Components/Image'
import Grid from 'Components/Grid'
import HStack from 'Components/HStack'

/**
 * @typedef { React.MouseEvent | TouchEvent | MouseEvent } HandledEvents
 */

/**
 * @typedef { import("lib/types").Media } Media
 * @type { Media }
 */
const defaultImage = {
  name: 'Default Image',
  src: 'https://f.shgcdn.com/3e439e58-55b0-417d-8475-9b8db731b619/',
  width: 720,
  height: 480,
}

/* Number of slides shown */
const VISIBLE_SLIDES = {
  base: 1,
  sm: 2,
  md: 3,
  lg: 3,
}

/* Gap between slides (rem) */
const SLIDE_GAP = 1

/* Slide image size (rem) */
const SLIDE_SIZE = {
  base: 5,
  sm: 6,
  md: 7,
  lg: 7,
}

/**
 * @typedef {{
 *  media?: Media[]
 *  backIcon?: React.ReactElement
 *  forwardIcon?: React.ReactElement
 * }} CarouselProps
 *
 * @param {CarouselProps} props
 * @returns
 */
const Carousel = props => {
  const iconSize = { base: '2rem', sm: '3rem', md: '4rem' }

  const {
    media = [],
    backIcon = <Icon icon="ChevronLeftIcon" w={iconSize} h={iconSize} />,
    forwardIcon = <Icon icon="ChevronRightIcon" w={iconSize} h={iconSize} />,
  } = props
  const numberOfSlides = media.length

  if (numberOfSlides === 0) {
    media.push(defaultImage)
  }

  const [currentSlide, setCurrentSlide] = React.useState(0)

  /** @type { import("@chakra-ui/react").Theme } */
  const theme = useTheme()

  /** @type { React.MutableRefObject<HTMLDivElement | null> } */
  const imageContainerRef = React.useRef(null)

  const goBack = React.useCallback(() => {
    setCurrentSlide(previous => (previous > 0 ? --previous : previous))
  }, [])

  const goForward = React.useCallback(() => {
    setCurrentSlide(previous => (previous < numberOfSlides - 1 ? ++previous : previous))
  }, [numberOfSlides])

  /** @type { import('react-swipeable').SwipeCallback } */
  const handleSwiping = React.useCallback(
    ({ deltaX }) => {
      if (
        !imageContainerRef.current ||
        (currentSlide === 0 && deltaX > 0) ||
        (currentSlide === numberOfSlides - 1 && deltaX < 0)
      ) {
        return
      }

      const { style } = imageContainerRef.current
      const scaleFactor = 10
      const scaledDeltaX = Math.round(deltaX / scaleFactor)
      const angle = Math.min(Math.abs(scaledDeltaX), 30)

      style.transformOrigin = deltaX > 0 ? 'bottom right' : 'bottom left'
      style.transform = deltaX > 0 ? `rotate(${angle}deg)` : `rotate(-${angle}deg)`
    },
    [currentSlide, numberOfSlides],
  )

  const resetImageAngle = React.useCallback(() => {
    if (!imageContainerRef.current) return
    imageContainerRef.current.style.transform = `rotate(0)`
  }, [])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goForward,
    onSwipedRight: goBack,
    onSwiping: handleSwiping,
  })

  React.useEffect(() => {
    resetImageAngle()
  }, [currentSlide, resetImageAngle])

  const { src, width = 2048, height = 2048 } = media[currentSlide]

  const styles = useMultiStyleConfig('Carousel', {
    currentSlide,
    numberOfSlides,
    numberOfVisibleSlides: VISIBLE_SLIDES,
    slideGap: SLIDE_GAP,
    slideSize: SLIDE_SIZE,
  })

  return (
    <Grid
      sx={styles.grid}
      tabIndex={0}
      templateAreas="'preview preview preview' 'back slider forward'"
      onKeyDown={handleKeyDown}
    >
      <Container
        gridArea="preview"
        sx={styles.containerMainImage}
        {...swipeHandlers}
        onTouchEnd={resetImageAngle}
      >
        <Container ref={imageContainerRef}>
          <Image
            src={src}
            alt=""
            htmlWidth={width.toString()}
            htmlHeight={height.toString()}
            sizes="(min-width: 768px) 50vw, 85vw"
            loading="eager"
          />
        </Container>
      </Container>

      <Container gridArea="back" sx={styles.containerPreviousButton}>
        <IconButton
          aria-label="Go to the previous image"
          variant="icon"
          icon={backIcon}
          disabled={currentSlide === 0}
          onClick={goBack}
        />
      </Container>

      <Container gridArea="slider" sx={styles.containerSlider}>
        <HStack sx={styles.hStack}>
          {media.map(({ src }, index) => (
            <Container
              key={src}
              tabIndex={0}
              data-slide-index={index}
              opacity={index === currentSlide ? 1 : 0.5}
              sx={styles.containerThumbnails}
              onClick={() => setCurrentSlide(index)}
              onFocus={() => setCurrentSlide(index)}
            >
              <Image
                src={src}
                alt=""
                htmlHeight={(SLIDE_SIZE.lg * 16).toString()}
                htmlWidth={(SLIDE_SIZE.lg * 16).toString()}
                sizes={`(min-width: ${theme.breakpoints.lg}) ${SLIDE_SIZE.lg}rem, (min-width: ${theme.breakpoints.md}) ${SLIDE_SIZE.md}rem, (min-width: ${theme.breakpoints.sm}) ${SLIDE_SIZE.sm}rem, ${SLIDE_SIZE.base}rem`}
              />
            </Container>
          ))}
        </HStack>
      </Container>

      <Container gridArea="forward" sx={styles.containerNextButton}>
        <IconButton
          aria-label="Go to the next image"
          variant="icon"
          icon={forwardIcon}
          disabled={currentSlide === numberOfSlides - 1}
          onClick={goForward}
        />
      </Container>
    </Grid>
  )

  /**
   * @param {React.KeyboardEvent<HTMLDivElement>} event
   */
  function handleKeyDown(event) {
    const { key, target } = event

    switch (key) {
      case 'Enter':
        if (target.hasOwnProperty('getAttribute')) {
          const slideIndex = /** @type { Element } */ (target).getAttribute('data-slide-index')

          if (slideIndex !== null) {
            setCurrentSlide(Number(slideIndex))
          }
        }
        break

      case 'ArrowLeft':
        goBack()
        break

      case 'ArrowRight':
        goForward()
        break

      case 'Escape':
        setCurrentSlide(0)
        break

      // no default
    }
  }
}

export default Carousel
