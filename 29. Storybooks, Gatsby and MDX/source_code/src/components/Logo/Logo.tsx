import React from 'react';
import tw from 'twin.macro';

export interface Props {
  /** The colour of the opening and closing tags. */
  accent?: string;
  /** The colour of main text. */
  color?: string;
  /** The colour when you hover over the logo. */
  hoverColor?: string;
  /** The main text of the logo for example, your name. */
  text: string;
  /** The size of the main text  */
  size?: 'xs' | 'sm' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const Logo = ({
  accent = 'black',
  color = 'black',
  hoverColor = 'blue-500',
  text,
  size = '2xl',
}: Props) => (
  <LogoContainer
    className={`hover:text-${hoverColor} text-${color} lg:text-${size}
    md:text-xl sm:text-md text-sm`}
  >
    <Tag className={`text-${accent}`} data-testid="OpeningTag">
      &lt;
    </Tag>
    {text}
    <Tag className={`text-${accent}`} data-testid="ClosingTag">
      /&gt;
    </Tag>
  </LogoContainer>
);

const LogoContainer = tw.div`cursor-pointer font-header font-black tracking-wide `;

const Tag = tw.span``;

export default Logo;
