import { createContext, useEffect, useRef, useState, useContext, useMemo } from "react"
import { usePrevious, useWindowScroll, useWindowSize } from "react-use"

const ScrollObserverContext = createContext()
const TriggerGroupContext = createContext()
const ReactorGroupContext = createContext()

function Root({ children, className, ...props }) {
  const [active, setActive] = useState(null)
  const previous = usePrevious(active)
  const isHidden = useMemo(() => active === null, [active])

  const context = {
    active,
    setActive,
    previous,
  }

  return (
    <ScrollObserverContext.Provider value={context}>
      <div className={className} {...props}>
        {typeof children === "function" ? children(isHidden) : children}
      </div>
    </ScrollObserverContext.Provider>
  )
}

function TriggerGroup({ children, className, ...props }) {
  const container = useRef(null)

  const [childElements, setChildElements] = useState([])

  useEffect(() => {
    if (container.current) {
      setChildElements(Array.from(container.current.children))
    }
  }, [])

  const context = { peers: childElements }

  return (
    <TriggerGroupContext.Provider value={context}>
      <div ref={container} className={className} {...props}>
        {children}
      </div>
    </TriggerGroupContext.Provider>
  )
}

function Trigger({ children, className, ...props }) {
  const container = useRef(null)

  const scrollObserverContext = useContext(ScrollObserverContext)
  const triggerGroupContext = useContext(TriggerGroupContext)

  // current element index
  const index = useMemo(() => {
    return triggerGroupContext.peers ? triggerGroupContext.peers.indexOf(container.current) : -1
  }, [triggerGroupContext.peers])

  const isFirst = useMemo(() => index === 0, [index])
  const isLast = useMemo(() => index === triggerGroupContext.peers.length - 1, [index])

  // active element
  const isActive = useMemo(() => scrollObserverContext.active === index, [scrollObserverContext.active, index])

  // component logic
  const { height: windowHeight } = useWindowSize()
  const { y: windowScroll } = useWindowScroll()

  const [y, setY] = useState(-1)
  const [height, setHeight] = useState(-1)

  useEffect(() => {
    if (!container.current) return
    const rect = container.current.getBoundingClientRect()
    setY(rect.top)
    setHeight(rect.height)
  }, [windowScroll])

  const isVisible = useMemo(() => {
    return y > windowHeight / 2 - height && y <= windowHeight / 2
  }, [windowHeight, y, height])

  useEffect(() => {
    if (isVisible) {
      scrollObserverContext.setActive(index)
    } else if (isFirst && y > windowHeight / 2 - height) {
      scrollObserverContext.setActive(null)
    } else if (isLast && y <= windowHeight / 2) {
      scrollObserverContext.setActive(null)
    }
  }, [isVisible, isFirst, isLast, y, windowHeight, height, index, scrollObserverContext])

  return (
    <div ref={container} className={className} {...props}>
      {children(isActive)}
    </div>
  )
}

export function ReactorGroup({ children, className, ...props }) {
  const container = useRef(null)

  const [childElements, setChildElements] = useState([])

  useEffect(() => {
    if (container.current) {
      setChildElements(Array.from(container.current.children))
    }
  }, [])

  const context = { peers: childElements }

  return (
    <ReactorGroupContext.Provider value={context}>
      <div ref={container} className={className} {...props}>
        {children}
      </div>
    </ReactorGroupContext.Provider>
  )
}

export function Reactor({ children, className, ...props }) {
  const container = useRef(null)

  const scrollObserverContext = useContext(ScrollObserverContext)
  const reactorGroupContext = useContext(ReactorGroupContext)

  const index = useMemo(() => {
    return reactorGroupContext.peers ? reactorGroupContext.peers.indexOf(container.current) : -1
  }, [reactorGroupContext.peers])

  // active element
  const isActive = useMemo(() => scrollObserverContext.active === index, [scrollObserverContext.active, index])

  return (
    <div ref={container} className={className} {...props}>
      {children(isActive)}
    </div>
  )
}

export const ScrollObserver = Object.assign(Root, { TriggerGroup, Trigger, ReactorGroup, Reactor })