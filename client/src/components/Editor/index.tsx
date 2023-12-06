import MonacoEditor from '@monaco-editor/react'
import './Index.scss'
import React, { useEffect, useState } from 'react'
import { LanguageContext } from '../../context/LanguageContext'
import { AuthContext } from '../../context/AuthContext'
import { CodeContext } from '../../context/CodeContext'
import { ThemeContext } from '../../context/ThemeContext'
import { Avatar, Box, IconButton, Tooltip } from '@mui/material'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { Link } from 'react-router-dom'
import { deepOrange } from '@mui/material/colors'
import { DEPLOYED_BACKEND_URL } from '../../utils/url'

function getKeyByValue<T>(
  object: Record<string, T>,
  value: T
): string | undefined {
  for (const key in object) {
    if (
      Object.prototype.hasOwnProperty.call(object, key) &&
      object[key] === value
    ) {
      return key
    }
  }
}

const Editor = () => {
  const LanuguageRef = React.useRef<any>(null)
  const editorRef = React.useRef<any>(null)

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor
  }

  const {
    LANGUAGES,
    setLanguage,
    language,
    languageCode,
    setLanguageCode,
    response,
    setResponse,
  } = React.useContext<any>(LanguageContext)

  const { userData, auth } = React.useContext<any>(AuthContext)
  const { code, setCode, input, setInput } = React.useContext<any>(CodeContext)
  const { theme, toggleTheme } = React.useContext<any>(ThemeContext)


  const [stdout, setStdout] = useState<string>('')
  const [stderr, setStderr] = useState<string>('')

  const [editortheme, setEditortheme] = useState<string>('vs-dark')

  useEffect(() => {
    if (language.toLowerCase() == 'java')
      return alert('Please use Main class only for java')
  }, [response, language, languageCode])

  // To get the image of user from the database, the image is in svg format
  const blob = new Blob([userData.image], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  useEffect(() => {
    if (window === undefined) return
    const localTheme = window.localStorage.getItem('theme')
    if (localTheme === "dark") {
      setEditortheme("vs-dark")

      const ele = document.getElementsByClassName("editor-light")[0];
      if (ele) {
        ele.classList.remove("editor-light")
        ele.classList.add("editor-dark")
      }
    } else if (localTheme === "light") {

      const ele = document.getElementsByClassName("editor-dark")[0];
      if (ele) {
        ele.classList.remove("editor-dark")
        ele.classList.add("editor-light")
      }
      setEditortheme("vs-light")
    } else {
      setEditortheme("vs-dark")
    }
  }, [theme])

  const handleSubmit = async () => {
    if (!editorRef.current || language == '') {
      alert('Please Select a Language')
      return
    }
    if (editorRef.current) {
      const data = {
        source_code: code,
        language_code: languageCode,
        source_input: input,
      }

      try {
        const response = await fetch(`${DEPLOYED_BACKEND_URL}code/execute/`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then((res) => res.json())

        setResponse(response)

        setStdout(
          response.result.split('\n').map((line: any, index: number) => {
            return (
              <React.Fragment key={index}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: line.replace(/ /g, '&nbsp;') + '&nbsp;',
                  }}
                />
              </React.Fragment>
            )
          })
        )

        setStderr(
          response.error.split('\n').map((line: any, index: number) => {
            return (
              <React.Fragment key={index}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: line.replace(/ /g, '&nbsp;'),
                  }}
                />
              </React.Fragment>
            )
          })
        )
      } catch (error) {
        console.error('An error occurred:', error)
      }
    }
  }

  return (
    <div className="editor-dark">
      <div className="select-bar">
        <div className="code-view">
          <Tooltip title="Go to home">
            <Link className="link" to="/">
              <i className="fas fa-angle-left"></i>
            </Link>
          </Tooltip>
          <select
            className="select"
            ref={LanuguageRef}
            placeholder="Select Language"
            defaultChecked={language}
            onChange={(e) => {
              setLanguageCode(
                getKeyByValue(LANGUAGES, e.target.value.toLowerCase())
              )
              setLanguage(e.target.value.toLowerCase())
            }}
          >
            {Object.keys(LANGUAGES).map((key, index) => (
              <option key={index}>
                {LANGUAGES[key].charAt(0).toUpperCase() +
                  LANGUAGES[key].slice(1)}
              </option>
            ))}
          </select>

          <div className="language">
            {language ? language.toUpperCase() : 'Language Not Selected'}
          </div>

          {/* Submit Button  */}
          <div className="buttons">
            <Tooltip title="Run Code">
              <button className="button" onClick={() => handleSubmit()}>
                <i className="fa fa-play"></i>
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="theme">
          <Tooltip title="Dark Mode">
            <IconButton
              style={{
                backgroundColor: "transparent",
                padding: "0px",
                boxShadow: "0 2px 10px rgba(255, 255, 255, 0.1)",
              }}
              onClick={() => {
                toggleTheme("dark");
              }}
            >
              <FiberManualRecordIcon fontSize='large' sx={{ color: 'blue' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Light Mode">
            <IconButton
              style={{
                backgroundColor: "transparent",
                padding: "0px",
                boxShadow: "0 2px 10px rgba(255, 255, 255, 0.1)",
              }}
              onClick={() => {
                toggleTheme("light");
              }}
            >
              <FiberManualRecordIcon fontSize='large' sx={{ color: 'white' }} />
            </IconButton>
            
          </Tooltip>

        </div>

        {auth && (
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Profile Summary">
              <IconButton
                sx={{ textTransform: 'uppercase', height: 50, width: 50 }}
              >
                <Avatar
                  alt={`${userData.first_name} ${userData.last_name}`}
                  src={url}
                  sx={{
                    width: 50,
                    height: 50,
                    bgcolor: deepOrange[500],
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </div>

      <div className="code-editor">
        <MonacoEditor
          theme={editortheme}
          language={"python"}
          height="90vh"
          width="75vw"
          onMount={handleEditorDidMount}
          onChange={(value) => setCode(value)}
        />

        <div className="terminal">
          <div className="t-1">
            <h1 className="heading">Output Terminal</h1>
            <div className="output">
              <br />
              {stdout}
              <div className="error">{stderr}</div>
            </div>
          </div>

          <div className="t-2">
            <h1 className="heading">Input Terminal</h1>
            <textarea className="input" onChange={(e) => setInput(e.target.value)}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Editor
