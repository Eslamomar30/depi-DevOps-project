import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Spinner,
} from "@material-tailwind/react";
import PropTypes from "prop-types";
import Skeleton from "react-loading-skeleton";

export function StatisticsCard({ color, icon, title, value, footer,loading=false }) {
  return (
<Card className="relative border border-blue-gray-100 shadow-sm">
  <CardHeader
    variant="gradient"
    color={color}
    floated={false}
    shadow={false}
    className="absolute top-0 left-0 grid h-8 w-8 place-items-center"
  >
    {icon}
  </CardHeader>

  {/* Push the body down by the header’s height (12 = 3rem) */}
  <CardBody className="pt-16 p-4 text-right">
    <Typography variant="h4" className="font-normal text-blue-gray-600 font-arabic">
      {title}
    </Typography>
<Typography variant="h2" color="blue-gray " className="font-arabic text-blue-500">
  {loading ? (
    <Spinner size="sm" className="animate-spin text-blue-500" />
  ) : (
    value
  )}
</Typography>

  </CardBody>

  {footer && (
    <CardFooter className="border-t border-blue-gray-50 p-4 font-arabic" children>
      {footer}
    </CardFooter>
  )}
</Card>


  );
}

StatisticsCard.defaultProps = {
  color: "blue",
  footer: null,
};

StatisticsCard.propTypes = {
  color: PropTypes.oneOf([
    "white",
    "blue-gray",
    "gray",
    "brown",
    "deep-orange",
    "orange",
    "amber",
    "yellow",
    "lime",
    "light-green",
    "green",
    "teal",
    "cyan",
    "light-blue",
    "blue",
    "indigo",
    "deep-purple",
    "purple",
    "pink",
    "red",
  ]),
  icon: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

StatisticsCard.displayName = "/src/widgets/cards/statistics-card.jsx";

export default StatisticsCard;
