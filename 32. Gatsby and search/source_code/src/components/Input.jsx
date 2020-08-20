import React from "react"
import tw from "twin.macro"

const Input = React.forwardRef(
  ({ className, label, onChange, placeholder = "", value }, ref) => (
    <TextInput
      ref={ref}
      aria-label={label}
      className={`bg-background text-header placeholder-main ${className}`}
      onChange={onChange}
      placeholder={placeholder}
      type="text"
      value={value}
    />
  )
)

const TextInput = tw.input`inline px-2 h-full w-full text-left inline text-lg transition duration-300`

export default Input
