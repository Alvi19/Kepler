import * as React from "react";
import ReactDOM from "react-dom/client";
import { connect, Provider } from "react-redux";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import document from "global/document";
import keplerGlReducer, { enhanceReduxMiddleware } from "@kepler.gl/reducers";
import KeplerGl from "@kepler.gl/components";
import { addDataToMap } from "@kepler.gl/actions";
import { KeplerGlSchema } from "@kepler.gl/schemas";
import { MapZoomWatcher } from "./MapZoomWatcher";

// Reducers & Store
const reducers = combineReducers({
  keplerGl: keplerGlReducer.initialState({
    uiState: {
      readOnly: false,
      currentModal: null,
    },
  }),
});

const middleWares = enhanceReduxMiddleware([
  /* Add other middlewares here */
]);
const enhancers = applyMiddleware(...middleWares);
const initialState = {};
const store = createStore(reducers, initialState, compose(enhancers));

const App = ({ dispatch }: any) => {
  React.useEffect(() => {
    fetch("/kepler.gl.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("File not found or fetch error");
        }
        return res.json();
      })
      .then((json: any) => {
        console.log("✅ JSON Loaded:", json);
        const loaded = KeplerGlSchema.load(json);
        console.log("🔄 Parsed Schema:", loaded);
        dispatch(addDataToMap(loaded));
      })
      .catch((err) => {
        console.error("❌ Error loading JSON:", err);
      });
    // fetch("/layer2-data.json")
    //   .then((res) => {
    //     if (!res.ok) {
    //       throw new Error("File not found or fetch error 2");
    //     }
    //     return res.json();
    //   })
    //   .then((json) => {
    //     console.log("✅ JSON Loaded: kepler2.json", json);
    //     const loaded = KeplerGlSchema.load(json);
    //     console.log("🔄 Parsed Schema: kepler2.json", loaded);
    //     dispatch(addDataToMap(loaded));
    //   })
    //   .catch((err) => {
    //     console.error("❌ Error loading kepler2.json:", err);
    //   });
  }, [dispatch]);

  return (
    <div
      style={{
        position: "absolute",
        top: "0px",
        left: "0px",
        width: "100%",
        height: "100%",
      }}
    >
      {/* <AutoSizer>
        {({ height, width }) => ( */}
      <KeplerGl
        // mapboxApiAccessToken="pk.eyJ1Ijoic3VwYXJkaTk4IiwiYSI6ImNtOXF5aGZrMDFqamYyanM5ZmhxZ2JsbHgifQ.eFm0ugCgcGv9hOSFYSFvkA"
        id="map"
      />
      <MapZoomWatcher dispatch={dispatch} />
      {/* )}
      </AutoSizer> */}
    </div>
  );
};

// Connect App to Redux
const mapStateToProps = (state) => state;
const dispatchToProps = (dispatch) => ({ dispatch });
const ConnectedApp = connect(mapStateToProps, dispatchToProps)(App);

const Root = () => (
  <Provider store={store}>
    <ConnectedApp />
  </Provider>
);

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<Root />);
