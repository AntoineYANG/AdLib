/*
 * @Author: Kanata You 
 * @Date: 2022-03-18 22:52:21 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-03-19 00:11:06
 */

import React from 'react';
import styled from 'styled-components';
// import { Link, useNavigate } from 'react-router-dom';

import PreferenceContext from '@context/preference';
import useShadow from '@utils/use-shadow';
import { ANI_HIDE_MS } from '@components/structure';
// import { HomepageContext } from '@views/homepage';


const Container = styled.section(() => ({
  margin: 0,
  // 抵消滚动条影响
  padding: '1vw calc(4vw - 12px) 1vw 4vw',
  flexGrow: 1,
  flexShrink: 0,
  display: 'flex',
  overflow: 'hidden',
  // 抵消滚动条影响
  transform: 'translateX(4px)'
}));

/**
 * @see https://neumorphism.io/
 */
const FormViewContainer = styled.div<{ darkMode: boolean }>(({ darkMode }) => `
  flex-grow: 1;
  flex-shrink: 1;
  padding: 30px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: wrap;
  color: ${darkMode ? '#d6d6d6' : '#202020'};
  background-color: ${darkMode ? '#101314' : '#e8f1fc'};
  ${
    Object.entries(useShadow({ darkMode })).map(
      ([k, v]) => `${k.replace(/[A-Z]/, upper => `-${upper.toLowerCase()}`)}: ${v};`
    ).join('\n')
  };

  > a.hiding {
    animation: card-hide cubic-bezier(0.6,0.2,0.9,1) ${ANI_HIDE_MS}ms forwards;
  }

  @media (max-width: 500px) {
    
    > a {
      flex-grow: 1;
      justify-content: center;

      > article {
        flex-grow: 1;
      }
    }
  }

  @media (min-width: 500px) {
    
    > a {
      flex-grow: 0;
      justify-content: flex-start;

      > article {
        flex-grow: 0;
      }
    }
  }
`);

// const Card = styled.article<{
//   darkMode: boolean;
//   active?: boolean;
// }>((
//   { darkMode, active = false }
// ) => ({
//   padding: '0.5em 0.7em',
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'space-around',
//   fontFamily: '"Microsoft Yahei", "微软雅黑", Menlo, Consolas, monospace',
//   WebkitFontSmoothing: 'antialiased',
//   MozOsxFontSmoothing: 'grayscale',
//   lineHeight: 1.2,
//   whiteSpace: 'pre-wrap',
//   backgroundColor: darkMode ? '#0c0e0e' : '#f0f7ff',
//   ...useShadow({
//     shape: active ? 'pressed' : 'convex',
//     size: 0.8,
//     distance: 0.3,
//     darkMode
//   })
// }));

// const _CardImg = styled.div<{
//   darkMode: boolean;
//   _src: string;
//   hide?: boolean;
// }>(({ darkMode, _src, hide = false }) => ({
//   position: 'relative',
//   left: darkMode ? 0 : undefined,
//   top: darkMode ? '-7.2vmax' : undefined,
//   clip: darkMode ? 'rect(0,1px,1px,0)' : undefined,
//   width: '8vmax',
//   height: '6vmax',
//   margin: '0.6vmax 1.2vmax',
//   marginBottom: darkMode ? '-7.2vmax' : undefined,
//   backgroundImage: `url(${_src})`,
//   backgroundAttachment: 'local',
//   backgroundSize: 'auto 190%',
//   backgroundRepeat: 'no-repeat',
//   backgroundPosition: '50% 30%',
//   opacity: hide ? 0 : 1,
//   filter: darkMode ? 'saturate(240%) contrast(180%) brightness(50%)' : undefined,
//   transition: `filter 200ms, opacity ${hide ? 360 : 720}ms`,
//   userSelect: 'none',
//   pointerEvents: 'none'
// }));

// const CardImg: React.FC<{
//   darkMode: boolean;
//   srcLight: string;
//   srcDark: string;
// }> = ({ darkMode, srcLight, srcDark }) => {
//   return (
//     <>
//       {/* 同时装载两张图片不仅是为了渐变，也保证了能够在初始时刻获取两张图片的资源 */}
//       <_CardImg
//         hide={darkMode}
//         role="presentation"
//         aria-hidden
//         _src={srcLight}
//         darkMode={false}
//       />
//       <_CardImg
//         hide={!darkMode}
//         role="presentation"
//         aria-hidden
//         _src={srcDark}
//         darkMode={true}
//       />
//     </>
//   );
// };

// const CardTitle = styled.header<{ darkMode: boolean }>((
//   { darkMode }
// ) => ({
//   margin: '0.5em 0 0',
//   fontSize: '1.05rem',
//   fontWeight: 600,
//   color: darkMode ? '#bdeef5' : '#1c1e21',
//   transition: 'color 200ms',
//   userSelect: 'none',
//   pointerEvents: 'none'
// }));

// const CardDesc = styled.p<{ darkMode: boolean }>((
//   { darkMode }
// ) => ({
//   margin: '0.8em 0.8em 1em',
//   maxWidth: '13vmax',
//   minWidth: '70%',
//   flexGrow: 1,
//   flexShrink: 1,
//   fontSize: '0.8rem',
//   fontWeight: 500,
//   lineHeight: 1.5,
//   color: darkMode ? '#8bb5bb' : '#41474e',
//   transition: 'color 200ms',
//   userSelect: 'none',
//   pointerEvents: 'none'
// }));

export interface CardProps {
  picSrcLight: string;
  picSrcDark: string;
  name: string;
  path: string;
  desc: string;
}

// /**
//  * 组件：卡片.
//  * 用作应用跳转.
//  */
// const AppCard = React.memo<CardProps>(({
//   picSrcLight, picSrcDark, name, path, desc
// }) => {
//   const { colorScheme } = PreferenceContext.useContext();
//   const [pressing, setPressing] = React.useState(false);
//   const [hovering, setHovering] = React.useState(false);

//   const { interactive, redirecting } = HomepageContext.useContext();

//   React.useEffect(() => {
//     const cb = (ev: MouseEvent) => {
//       if (ev.buttons === 0) {
//         // 鼠标左键不在按下状态
//         setTimeout(() => {
//           const { redirecting } = HomepageContext.state;

//           if (pressing) {
//             if (redirecting === path) {
//               return;
//             }
            
//             setPressing(false);
//           }
//         }, 0);
//       }
//     };

//     document.body.addEventListener('mousemove', cb);

//     return () => document.body.removeEventListener('mousemove', cb);
//   }, [pressing, path]);

//   const make = <F extends (...args: any) => any>(cb: F): F | undefined => {
//     return interactive ? cb : undefined;
//   };

//   const navigate = useNavigate();

//   const onFocus = make(() => {
//     setHovering(true);
//   });

//   const onFocusOut = make(() => {
//     setHovering(false);
//   });

//   return (
//     <Link
//       className={redirecting && redirecting !== path ? 'hiding' : undefined}
//       to={path}
//       onMouseOver={onFocus}
//       onMouseOut={onFocusOut}
//       onClick={e => {
//         e.preventDefault();

//         if (interactive) {
//           HomepageContext.actions.openPathSync(path);
//           setTimeout(() => {
//             navigate(`/${path}`);
//           }, ANI_HIDE_MS);
//         }
//       }}
//       onMouseDown={make(() => setPressing(true))}
//       onTouchStart={make(() => [setPressing(true), onFocus?.()])}
//       onTouchEnd={make(() => [setPressing(false), onFocusOut?.()])}
//       onFocus={make(() => [setPressing(true), onFocus?.()])}
//       onBlur={make(() => [setPressing(false), onFocusOut?.()])}
//       style={{
//         flexShrink: 1,
//         alignSelf: 'stretch',
//         display: 'flex',
//         margin: '0.6em 1em',
//         textDecoration: 'none',
//         outline: 'none'
//       }}
//       onDragStart={e => e.preventDefault()}
//       role="link"
//       aria-label={name}
//       aria-description={desc}
//     >
//       <Card
//         darkMode={colorScheme === 'dark'}
//         active={pressing}
//       >
//         <CardImg
//           srcLight={picSrcLight}
//           srcDark={picSrcDark}
//           darkMode={!(hovering || pressing)}
//         />
//         <CardTitle
//           darkMode={colorScheme === 'dark'}
//         >
//           {name}
//         </CardTitle>
//         <CardDesc
//           darkMode={colorScheme === 'dark'}
//         >
//           {desc}
//         </CardDesc>
//       </Card>
//     </Link>
//   );
// });

const _Spring = styled.div({
  width: '100%',
  height: '100%',
  flexGrow: 999,
  flexShrink: 999
});

const Spring: React.FC = () => (
  <_Spring
    role="presentation"
    aria-hidden
  />
);

export interface FormViewProps {}

/**
 * 组件：表单组.
 * 配置表单项目.
 */
const FormView = React.memo<FormViewProps>(function FormView () {
  const { colorScheme } = PreferenceContext.useContext();

  return (
    <Container>
      <FormViewContainer darkMode={colorScheme === 'dark'}>
        {/* 撑开列表底部空白 */}
        <Spring />
      </FormViewContainer>
    </Container>
  );
});


export default FormView;
